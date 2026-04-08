param(
  [string]$BaseUrl = "http://127.0.0.1:8000/api"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers,
    $Body = $null
  )

  try {
    $params = @{
      Method          = $Method
      Uri             = $Url
      TimeoutSec      = 20
      UseBasicParsing = $true
    }

    if ($Headers) {
      $params.Headers = $Headers
    }

    if ($null -ne $Body) {
      $params.ContentType = "application/json"
      $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    $response = Invoke-WebRequest @params
    $data = $null
    if ($response.Content) {
      try { $data = $response.Content | ConvertFrom-Json } catch { $data = $response.Content }
    }

    return [pscustomobject]@{
      ok     = $true
      status = [int]$response.StatusCode
      data   = $data
    }
  } catch {
    $status = 0
    $data = $null

    if ($_.Exception.Response) {
      try { $status = [int]$_.Exception.Response.StatusCode } catch {}
      try {
        $raw = $_.Exception.Response.Content
        if ($raw) {
          try { $data = $raw | ConvertFrom-Json } catch { $data = $raw }
        }
      } catch {}
    }

    return [pscustomobject]@{
      ok     = $false
      status = $status
      data   = $data
    }
  }
}

$results = New-Object System.Collections.Generic.List[Object]

function Add-Result {
  param(
    [string]$Case,
    [bool]$Pass,
    [string]$Detail
  )

  $results.Add([pscustomobject]@{
    Case   = $Case
    Pass   = $Pass
    Detail = $Detail
  })
}

Write-Host "== Smoke API ==" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"

$healthBase = $BaseUrl
if ($healthBase -match "/api/?$") {
  $healthBase = $healthBase -replace "/api/?$", ""
}
$healthUrl = "$healthBase/health"

$health = Invoke-Api -Method "GET" -Url $healthUrl -Headers @{}
Add-Result -Case "health" -Pass ($health.ok -and $health.status -eq 200) -Detail ("status=" + $health.status)

$adminLogin = Invoke-Api -Method "POST" -Url "$BaseUrl/auth/login" -Headers @{} -Body @{ identifier = "ADM-001@company"; password = "Admin@123" }
$managerLogin = Invoke-Api -Method "POST" -Url "$BaseUrl/auth/login" -Headers @{} -Body @{ identifier = "MGR-ENG-001@company"; password = "Manager@123" }
$employeeLogin = Invoke-Api -Method "POST" -Url "$BaseUrl/auth/login" -Headers @{} -Body @{ identifier = "EMP-ENG-001@company"; password = "Employee@123" }

Add-Result -Case "login_admin" -Pass ($adminLogin.ok -and $adminLogin.status -eq 200) -Detail ("status=" + $adminLogin.status)
Add-Result -Case "login_manager" -Pass ($managerLogin.ok -and $managerLogin.status -eq 200) -Detail ("status=" + $managerLogin.status)
Add-Result -Case "login_employee" -Pass ($employeeLogin.ok -and $employeeLogin.status -eq 200) -Detail ("status=" + $employeeLogin.status)

if (-not ($adminLogin.ok -and $managerLogin.ok -and $employeeLogin.ok)) {
  $results | Format-Table -AutoSize
  Write-Error "Login failed. Stop smoke."
}

$adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.data.access_token)" }
$managerHeaders = @{ Authorization = "Bearer $($managerLogin.data.data.access_token)" }
$employeeHeaders = @{ Authorization = "Bearer $($employeeLogin.data.data.access_token)" }

$meAdmin = Invoke-Api -Method "GET" -Url "$BaseUrl/auth/me" -Headers $adminHeaders
Add-Result -Case "auth_me_admin" -Pass ($meAdmin.ok -and $meAdmin.status -eq 200) -Detail ("status=" + $meAdmin.status)

$usersAdmin = Invoke-Api -Method "GET" -Url "$BaseUrl/users" -Headers $adminHeaders
$usersManager = Invoke-Api -Method "GET" -Url "$BaseUrl/users" -Headers $managerHeaders
Add-Result -Case "users_admin_allowed" -Pass ($usersAdmin.ok -and $usersAdmin.status -eq 200) -Detail ("status=" + $usersAdmin.status)
Add-Result -Case "users_manager_forbidden" -Pass ((-not $usersManager.ok) -and $usersManager.status -eq 403) -Detail ("status=" + $usersManager.status)

$ws = Invoke-Api -Method "GET" -Url "$BaseUrl/workspace/bootstrap" -Headers $adminHeaders
$wsOk = $ws.ok -and $ws.status -eq 200
Add-Result -Case "workspace_bootstrap_admin" -Pass $wsOk -Detail ("status=" + $ws.status)

if ($wsOk) {
  $employees = @($ws.data.data.employees)
  $periods = @($ws.data.data.periods)
  $sampleEmployee = $employees | Where-Object { $_.role -eq "employee" } | Select-Object -First 1

  $allPeriodsHaveReview = $true
  foreach ($period in $periods) {
    $wsOne = Invoke-Api -Method "GET" -Url "$BaseUrl/workspace/bootstrap?employee_id=$($sampleEmployee.id)&period_id=$($period.id)" -Headers $adminHeaders
    if (-not ($wsOne.ok -and $wsOne.status -eq 200 -and $null -ne $wsOne.data.data.review)) {
      $allPeriodsHaveReview = $false
      break
    }
  }

  Add-Result -Case "workspace_switch_period_keeps_review" -Pass $allPeriodsHaveReview -Detail ("periods_checked=" + $periods.Count)
} else {
  Add-Result -Case "workspace_switch_period_keeps_review" -Pass $false -Detail "bootstrap_failed"
}

$empCreateCycle = Invoke-Api -Method "POST" -Url "$BaseUrl/cycles" -Headers $employeeHeaders -Body @{
  name       = "Employee Forbidden Cycle"
  start_date = "2026-10-01"
  end_date   = "2026-12-31"
  status     = "planning"
}
Add-Result -Case "employee_cannot_create_cycle" -Pass ((-not $empCreateCycle.ok) -and $empCreateCycle.status -eq 403) -Detail ("status=" + $empCreateCycle.status)

$mgrCreateCycle = Invoke-Api -Method "POST" -Url "$BaseUrl/cycles" -Headers $managerHeaders -Body @{
  name       = "Manager Smoke Cycle"
  start_date = "2026-10-01"
  end_date   = "2026-12-31"
  status     = "planning"
}
Add-Result -Case "manager_can_create_cycle" -Pass ($mgrCreateCycle.ok -and $mgrCreateCycle.status -eq 201) -Detail ("status=" + $mgrCreateCycle.status)

$cycles = Invoke-Api -Method "GET" -Url "$BaseUrl/cycles" -Headers $employeeHeaders
$activeCycle = $null
if ($cycles.ok) {
  $activeCycle = @($cycles.data.data) | Where-Object { $_.status -eq "active" } | Select-Object -First 1
}
Add-Result -Case "employee_can_list_cycles" -Pass ($cycles.ok -and $cycles.status -eq 200 -and $null -ne $activeCycle) -Detail ("status=" + $cycles.status)

$empObjective = $null
if ($null -ne $activeCycle) {
  $empObjective = Invoke-Api -Method "POST" -Url "$BaseUrl/objectives" -Headers $employeeHeaders -Body @{
    cycle_id       = [int]$activeCycle.id
    title          = "Employee smoke objective"
    description    = "Objective created by employee smoke test"
    objective_type = "individual"
    due_date       = $activeCycle.end_date
  }
}
Add-Result -Case "employee_can_create_own_objective" -Pass ($null -ne $empObjective -and $empObjective.ok -and $empObjective.status -eq 201) -Detail ("status=" + $(if ($empObjective) { $empObjective.status } else { 0 }))

$empKr = $null
if ($empObjective -and $empObjective.ok) {
  $empKr = Invoke-Api -Method "POST" -Url "$BaseUrl/key-results" -Headers $employeeHeaders -Body @{
    objective_id      = [int]$empObjective.data.data.id
    title             = "Employee smoke KR"
    description       = "KR created by employee smoke test"
    start_value       = 0
    current_value     = 20
    target_value      = 100
    direction         = "increase"
    measurement_unit  = "%"
  }
}
Add-Result -Case "employee_can_create_own_key_result" -Pass ($null -ne $empKr -and $empKr.ok -and $empKr.status -eq 201) -Detail ("status=" + $(if ($empKr) { $empKr.status } else { 0 }))

$empCheckin = $null
if ($empKr -and $empKr.ok) {
  $empCheckin = Invoke-Api -Method "POST" -Url "$BaseUrl/checkins" -Headers $employeeHeaders -Body @{
    key_result_id    = [int]$empKr.data.data.id
    value_after      = 35
    checkin_date     = "2026-05-15"
    confidence_level = 7
    note             = "Smoke check-in by employee"
  }
}
Add-Result -Case "employee_can_checkin_own_kr" -Pass ($null -ne $empCheckin -and $empCheckin.ok -and $empCheckin.status -eq 201) -Detail ("status=" + $(if ($empCheckin) { $empCheckin.status } else { 0 }))

$dashboardSummary = Invoke-Api -Method "GET" -Url "$BaseUrl/dashboard/summary" -Headers $adminHeaders
$dashboardCharts = Invoke-Api -Method "GET" -Url "$BaseUrl/dashboard/charts" -Headers $adminHeaders
Add-Result -Case "dashboard_summary_admin" -Pass ($dashboardSummary.ok -and $dashboardSummary.status -eq 200) -Detail ("status=" + $dashboardSummary.status)
Add-Result -Case "dashboard_charts_admin" -Pass ($dashboardCharts.ok -and $dashboardCharts.status -eq 200) -Detail ("status=" + $dashboardCharts.status)

if ($mgrCreateCycle.ok -and $mgrCreateCycle.status -eq 201) {
  $createdCycleId = [int]$mgrCreateCycle.data.data.id
  $cleanup = Invoke-Api -Method "DELETE" -Url "$BaseUrl/cycles/$createdCycleId" -Headers $managerHeaders
  Add-Result -Case "cleanup_created_cycle" -Pass ($cleanup.ok -and $cleanup.status -eq 204) -Detail ("status=" + $cleanup.status)
}

$results | Format-Table -AutoSize

$failed = @($results | Where-Object { -not $_.Pass })
if ($failed.Count -gt 0) {
  Write-Host ""
  Write-Host "FAILED CASES: $($failed.Count)" -ForegroundColor Red
  $failed | Format-Table -AutoSize
  exit 1
}

Write-Host ""
Write-Host "All smoke cases passed." -ForegroundColor Green
exit 0
