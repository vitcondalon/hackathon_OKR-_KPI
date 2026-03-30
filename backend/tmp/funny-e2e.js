const base = process.env.TEST_BASE || 'http://localhost:8014/api';
const failures = [];
const results = [];

async function req(path, opt = {}) {
  const res = await fetch(base + path, {
    ...opt,
    headers: {
      'Content-Type': 'application/json',
      ...(opt.headers || {})
    }
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { status: res.status, json, text };
}

function check(cond, msg, data = null) {
  if (!cond) {
    failures.push(msg);
    results.push({ ok: false, msg, data });
  } else {
    results.push({ ok: true, msg });
  }
}

async function login(identifier, password) {
  const r = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  });
  check(r.status === 200, `login ${identifier} should be 200`, r);
  return r.json?.data?.access_token;
}

async function main() {
  const unauth = await req('/funny/suggestions');
  check(unauth.status === 401, 'unauthorized suggestions should be 401', unauth);

  const admin = await login('admin@okr.local', 'Admin@123');
  const manager = await login('manager.eng@okr.local', 'Manager@123');
  const employee = await login('lan@okr.local', 'Employee@123');

  check(Boolean(admin), 'admin token exists');
  check(Boolean(manager), 'manager token exists');
  check(Boolean(employee), 'employee token exists');

  const health = await req('/funny/health', {
    headers: { Authorization: `Bearer ${admin}` }
  });
  check(health.status === 200, 'funny health admin 200', health);
  check(health.json?.dbConnected === true, 'funny health dbConnected true', health);
  check(typeof health.json?.geminiConfigured === 'boolean', 'funny health geminiConfigured boolean', health);

  const suggestions = await req('/funny/suggestions', {
    headers: { Authorization: `Bearer ${admin}` }
  });
  check(suggestions.status === 200, 'funny suggestions 200', suggestions);
  check(Array.isArray(suggestions.json?.suggestions) && suggestions.json.suggestions.length >= 5, 'funny suggestions has >=5 items', suggestions);

  const intentCases = [
    ['Hien tai co bao nhieu nhan vien?', 'count_users'],
    ['Co bao nhieu phong ban?', 'count_departments'],
    ['Chu ky nao dang hoat dong?', 'active_cycles'],
    ['Objective nao dang co tien do thap nhat?', 'low_progress_objectives'],
    ['KPI nao dang rui ro?', 'risky_kpis'],
    ['Phong ban nao dang tot nhat?', 'top_departments'],
    ['Tom tat tinh hinh he thong hien tai', 'dashboard_summary'],
    ['Hay cho toi biet nhung muc duoi 50% tien do', 'low_progress_objectives'],
    ['Nhan su nao dang co hieu suat tot nhat?', 'top_performers'],
    ['Tinh hinh KPI phong ban the nao?', 'risky_kpis']
  ];

  for (const [message, expectedIntent] of intentCases) {
    const r = await req('/funny/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${admin}` },
      body: JSON.stringify({ message })
    });

    check(r.status === 200, `chat admin '${message}' 200`, r);
    check(r.json?.intent === expectedIntent, `chat intent '${message}' => ${expectedIntent}`, r);
    check(typeof r.json?.answer === 'string' && r.json.answer.length > 0, `chat answer exists '${message}'`, r);
  }

  const generic = await req('/funny/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin}` },
    body: JSON.stringify({ message: 'Hay phan tich tong quan va dua ra nhan dinh xu huong cho dashboard hien tai' })
  });

  check(generic.status === 200, 'generic analysis 200', generic);
  check(generic.json?.intent === 'generic_analysis', 'generic intent detected', generic);
  check(generic.json?.meta?.fallback === true, 'generic fallback true when no gemini key', generic);
  check(generic.json?.meta?.usedAI === false, 'generic usedAI false when no gemini key', generic);

  const employeeAllowed = await req('/funny/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employee}` },
    body: JSON.stringify({ message: 'Hien tai co bao nhieu nhan vien?' })
  });
  check(employeeAllowed.status === 200, 'employee allowed count_users', employeeAllowed);

  const employeeDenied = await req('/funny/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${employee}` },
    body: JSON.stringify({ message: 'Nhan su nao dang co hieu suat tot nhat?' })
  });
  check(employeeDenied.status === 403, 'employee denied top_performers', employeeDenied);

  const badBody = await req('/funny/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${admin}` },
    body: JSON.stringify({ message: '' })
  });
  check(badBody.status === 400, 'chat validation empty message => 400', badBody);

  const summary = {
    passed: failures.length === 0,
    total: results.length,
    failed: failures.length,
    failures,
    failedDetails: results.filter((r) => !r.ok)
  };

  console.log(JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});