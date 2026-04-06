function getServerUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${protocol}://${req.get('host')}`;
}

function buildOpenApiSpec(req) {
  const baseUrl = getServerUrl(req);

  return {
    openapi: '3.0.3',
    info: {
      title: 'OKR / KPI HR Backend API',
      version: '1.0.0',
      description: 'API documentation for the OKR/KPI HR platform with the active workspace review flow.'
    },
    servers: [
      {
        url: `${baseUrl}/api`,
        description: 'Current environment'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            identifier: { type: 'string', example: 'ADM-001@company' },
            password: { type: 'string', example: 'Admin@123' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          description: 'Username, email, and employee_code are auto-generated when omitted.',
          required: ['full_name', 'password'],
          properties: {
            employee_code: { type: 'string', example: 'EMP-ENG-002' },
            full_name: { type: 'string', example: 'Nguyen Van Test' },
            username: { type: 'string', example: 'emp-eng-002' },
            email: { type: 'string', format: 'email', example: 'emp-eng-002@company' },
            password: { type: 'string', example: 'Employee@123' },
            role: { type: 'string', enum: ['admin', 'hr', 'manager', 'employee'], example: 'employee' },
            department_id: { type: 'integer', nullable: true, example: 1 },
            manager_user_id: { type: 'integer', nullable: true, example: 2 },
            is_active: { type: 'boolean', example: true }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            employee_code: { type: 'string', example: 'EMP-ENG-002' },
            full_name: { type: 'string', example: 'Nguyen Van Test Updated' },
            username: { type: 'string', example: 'emp-eng-002' },
            email: { type: 'string', format: 'email', example: 'emp-eng-002@company' },
            password: { type: 'string', example: 'Employee@123' },
            role: { type: 'string', enum: ['admin', 'hr', 'manager', 'employee'], example: 'employee' },
            department_id: { type: 'integer', nullable: true, example: 1 },
            manager_user_id: { type: 'integer', nullable: true, example: 2 },
            is_active: { type: 'boolean', example: true }
          }
        },
        DepartmentRequest: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'MKT' },
            name: { type: 'string', example: 'Marketing' },
            description: { type: 'string', nullable: true, example: 'Marketing and branding' },
            manager_user_id: { type: 'integer', nullable: true, example: 2 },
            is_active: { type: 'boolean', example: true }
          }
        },
        CycleRequest: {
          type: 'object',
          properties: {
            code: { type: 'string', example: '2026-Q4' },
            name: { type: 'string', example: 'Q4 2026' },
            start_date: { type: 'string', format: 'date', example: '2026-10-01' },
            end_date: { type: 'string', format: 'date', example: '2026-12-31' },
            status: { type: 'string', enum: ['planning', 'active', 'closed'], example: 'planning' }
          },
          required: ['name', 'start_date', 'end_date']
        },
        ObjectiveRequest: {
          type: 'object',
          properties: {
            cycle_id: { type: 'integer', example: 2 },
            code: { type: 'string', example: 'ENG-QUALITY' },
            title: { type: 'string', example: 'Improve API quality and stability' },
            description: { type: 'string', nullable: true, example: 'Reduce incidents and improve release confidence' },
            owner_user_id: { type: 'integer', example: 2 },
            department_id: { type: 'integer', nullable: true, example: 1 },
            parent_objective_id: { type: 'integer', nullable: true, example: null },
            objective_type: { type: 'string', enum: ['company', 'department', 'individual'], example: 'department' },
            status: { type: 'string', enum: ['draft', 'on_track', 'at_risk', 'completed', 'cancelled'], example: 'on_track' },
            priority: { type: 'integer', minimum: 1, maximum: 5, example: 3 },
            progress_percent: { type: 'number', example: 35 },
            start_date: { type: 'string', format: 'date', example: '2026-10-01' },
            due_date: { type: 'string', format: 'date', example: '2026-12-20' }
          }
        },
        KeyResultRequest: {
          type: 'object',
          properties: {
            objective_id: { type: 'integer', example: 1 },
            code: { type: 'string', example: 'KR-API-01' },
            title: { type: 'string', example: 'Reduce P1 incidents by 50%' },
            description: { type: 'string', nullable: true, example: 'Compare with previous quarter baseline' },
            owner_user_id: { type: 'integer', nullable: true, example: 5 },
            measurement_unit: { type: 'string', nullable: true, example: '%' },
            direction: { type: 'string', enum: ['increase', 'decrease', 'maintain'], example: 'decrease' },
            start_value: { type: 'number', example: 10 },
            target_value: { type: 'number', example: 5 },
            current_value: { type: 'number', example: 8 },
            status: { type: 'string', enum: ['draft', 'on_track', 'at_risk', 'completed', 'cancelled'], example: 'on_track' },
            weight: { type: 'number', example: 40 }
          }
        },
        CheckinRequest: {
          type: 'object',
          description: 'Use key_result_id OR kpi_metric_id (not both).',
          properties: {
            key_result_id: { type: 'integer', nullable: true, example: 1 },
            kpi_metric_id: { type: 'integer', nullable: true, example: null },
            checkin_date: { type: 'string', format: 'date', example: '2026-05-16' },
            value_after: { type: 'number', example: 45 },
            progress_percent: { type: 'number', example: 60 },
            confidence_level: { type: 'integer', nullable: true, example: 7 },
            update_note: { type: 'string', nullable: true, example: 'Debug checkin update' },
            note: { type: 'string', nullable: true, example: 'KPI checkin note' },
            blocker_note: { type: 'string', nullable: true, example: null }
          }
        },
        KpiRequest: {
          type: 'object',
          properties: {
            cycle_id: { type: 'integer', example: 2 },
            code: { type: 'string', example: 'KPI-ENG-SLA' },
            scope_type: { type: 'string', enum: ['employee', 'department'], example: 'department' },
            name: { type: 'string', example: 'Engineering SLA compliance' },
            description: { type: 'string', nullable: true, example: 'Ticket SLA compliance metric' },
            owner_user_id: { type: 'integer', nullable: true, example: null },
            department_id: { type: 'integer', nullable: true, example: 1 },
            measurement_unit: { type: 'string', nullable: true, example: '%' },
            direction: { type: 'string', enum: ['increase', 'decrease', 'maintain'], example: 'increase' },
            start_value: { type: 'number', example: 70 },
            target_value: { type: 'number', example: 95 },
            current_value: { type: 'number', example: 82 },
            weight: { type: 'number', example: 35 },
            status: { type: 'string', enum: ['active', 'on_track', 'at_risk', 'completed', 'cancelled'], example: 'on_track' }
          }
        },
        WorkspacePeriodRequest: {
          type: 'object',
          required: ['name', 'period_type', 'start_date', 'end_date'],
          properties: {
            code: { type: 'string', example: '2026-Q3' },
            name: { type: 'string', example: 'Q3 2026' },
            period_type: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], example: 'quarterly' },
            start_date: { type: 'string', format: 'date', example: '2026-07-01' },
            end_date: { type: 'string', format: 'date', example: '2026-09-30' },
            status: { type: 'string', enum: ['planning', 'active', 'closed'], example: 'planning' }
          }
        },
        WorkspaceReviewRequest: {
          type: 'object',
          required: ['employee_user_id', 'period_id'],
          properties: {
            employee_user_id: { type: 'integer', example: 6 },
            period_id: { type: 'integer', example: 2 }
          }
        },
        WorkspaceReviewItemRequest: {
          type: 'object',
          required: ['category', 'weight'],
          properties: {
            category: { type: 'string', example: 'Project KPI' },
            project_code: { type: 'string', nullable: true, example: 'PRJ-API-01' },
            project_name: { type: 'string', nullable: true, example: 'API Platform Upgrade' },
            description: { type: 'string', nullable: true, example: 'Delivered the API upgrade target and stabilized the deployment flow.' },
            weight: { type: 'number', example: 3 },
            plan_percent: { type: 'number', nullable: true, example: 100 },
            actual_percent: { type: 'number', nullable: true, example: 86 },
            evidence_note: { type: 'string', nullable: true, example: 'Release notes and deployment log attached.' },
            manager_note: { type: 'string', nullable: true, example: 'Manager review note.' },
            is_required: { type: 'boolean', example: true }
          }
        },
        WorkspaceReviewItemUpdateRequest: {
          type: 'object',
          properties: {
            category: { type: 'string', example: 'Project KPI' },
            project_code: { type: 'string', nullable: true, example: 'PRJ-API-01' },
            project_name: { type: 'string', nullable: true, example: 'API Platform Upgrade' },
            description: { type: 'string', nullable: true, example: 'Delivered the API upgrade target and stabilized the deployment flow.' },
            weight: { type: 'number', example: 3 },
            plan_percent: { type: 'number', nullable: true, example: 100 },
            actual_percent: { type: 'number', nullable: true, example: 90 },
            evidence_note: { type: 'string', nullable: true, example: 'Updated evidence note.' },
            manager_note: { type: 'string', nullable: true, example: 'Manager updated note.' },
            is_required: { type: 'boolean', example: true },
            is_locked: { type: 'boolean', example: false }
          }
        },
        WorkspaceCommentRequest: {
          type: 'object',
          required: ['content'],
          properties: {
            comment_type: { type: 'string', enum: ['employee_self', 'manager', 'hr', 'final'], example: 'manager' },
            content: { type: 'string', example: 'The employee showed steady progress this cycle.' }
          }
        },
        WorkspaceActionRequest: {
          type: 'object',
          required: ['action'],
          properties: {
            action: { type: 'string', enum: ['submit', 'return', 'manager_approve', 'hr_approve', 'approve', 'lock', 'unlock'], example: 'manager_approve' },
            note: { type: 'string', nullable: true, example: 'Approved after manager review.' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {},
            meta: { type: 'object', nullable: true, additionalProperties: true },
            errors: {
              type: 'array',
              nullable: true,
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', nullable: true },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Departments' },
      { name: 'Cycles' },
      { name: 'Objectives' },
      { name: 'Key Results' },
      { name: 'Check-ins' },
      { name: 'KPIs' },
      { name: 'Dashboard' },
      { name: 'Workspace' },
      { name: 'Guides' }
    ],
    paths: {
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: { description: 'OK' },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
        }
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List users (admin only)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' } }
        },
        post: {
          tags: ['Users'],
          summary: 'Create user (admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by id (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } }
        },
        put: {
          tags: ['Users'],
          summary: 'Update user (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' } }
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user (admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 204: { description: 'No Content' }, 403: { description: 'Forbidden' } }
        }
      },
      '/departments': {
        get: { tags: ['Departments'], summary: 'List departments', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Departments'],
          summary: 'Create department',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DepartmentRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/departments/{id}': {
        put: {
          tags: ['Departments'],
          summary: 'Update department',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DepartmentRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['Departments'],
          summary: 'Delete department',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 204: { description: 'No Content' } }
        }
      },
      '/cycles': {
        get: { tags: ['Cycles'], summary: 'List cycles', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Cycles'],
          summary: 'Create cycle',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CycleRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/cycles/{id}': {
        put: {
          tags: ['Cycles'],
          summary: 'Update cycle',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CycleRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/objectives': {
        get: { tags: ['Objectives'], summary: 'List objectives', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Objectives'],
          summary: 'Create objective',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ObjectiveRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/objectives/{id}': {
        get: {
          tags: ['Objectives'],
          summary: 'Get objective by id',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'OK' } }
        },
        put: {
          tags: ['Objectives'],
          summary: 'Update objective',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ObjectiveRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['Objectives'],
          summary: 'Delete objective',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 204: { description: 'No Content' } }
        }
      },
      '/key-results': {
        get: { tags: ['Key Results'], summary: 'List key results', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Key Results'],
          summary: 'Create key result',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KeyResultRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/key-results/{id}': {
        put: {
          tags: ['Key Results'],
          summary: 'Update key result',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KeyResultRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['Key Results'],
          summary: 'Delete key result',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 204: { description: 'No Content' } }
        }
      },
      '/checkins': {
        get: { tags: ['Check-ins'], summary: 'List check-ins', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['Check-ins'],
          summary: 'Create check-in',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckinRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/kpis': {
        get: { tags: ['KPIs'], summary: 'List KPIs', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
        post: {
          tags: ['KPIs'],
          summary: 'Create KPI',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KpiRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/kpis/{id}': {
        put: {
          tags: ['KPIs'],
          summary: 'Update KPI',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/KpiRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        },
        delete: {
          tags: ['KPIs'],
          summary: 'Delete KPI',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
          responses: { 204: { description: 'No Content' } }
        }
      },
      '/dashboard/summary': { get: { tags: ['Dashboard'], summary: 'Summary', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
      '/dashboard/progress': { get: { tags: ['Dashboard'], summary: 'Progress', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
      '/dashboard/risks': { get: { tags: ['Dashboard'], summary: 'Risks', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
      '/dashboard/top-performers': { get: { tags: ['Dashboard'], summary: 'Top performers', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
      '/dashboard/charts': { get: { tags: ['Dashboard'], summary: 'Charts', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } } },
      '/workspace/bootstrap': {
        get: {
          tags: ['Workspace'],
          summary: 'Get workspace bootstrap data',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
        }
      },
      '/workspace/periods': {
        post: {
          tags: ['Workspace'],
          summary: 'Create workspace review period',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspacePeriodRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/workspace/reviews': {
        post: {
          tags: ['Workspace'],
          summary: 'Create workspace review record',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspaceReviewRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/workspace/reviews/{reviewId}/items': {
        post: {
          tags: ['Workspace'],
          summary: 'Add workspace review item',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspaceReviewItemRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/workspace/reviews/{reviewId}/items/{itemId}': {
        put: {
          tags: ['Workspace'],
          summary: 'Update workspace review item',
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } },
            { in: 'path', name: 'itemId', required: true, schema: { type: 'integer' } }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspaceReviewItemUpdateRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' } }
        }
      },
      '/workspace/reviews/{reviewId}/comments': {
        post: {
          tags: ['Workspace'],
          summary: 'Add workspace review comment',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspaceCommentRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' }, 403: { description: 'Forbidden' } }
        }
      },
      '/workspace/reviews/{reviewId}/actions': {
        post: {
          tags: ['Workspace'],
          summary: 'Apply workspace review action',
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'reviewId', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/WorkspaceActionRequest' }
              }
            }
          },
          responses: { 200: { description: 'OK' }, 403: { description: 'Forbidden' } }
        }
      },
      '/guides/user-guide': { get: { tags: ['Guides'], summary: 'User guide info', responses: { 200: { description: 'OK' } } } },
      '/guides/user-guide/view': { get: { tags: ['Guides'], summary: 'User guide HTML view', responses: { 200: { description: 'OK' } } } },
      '/guides/user-guide/download': { get: { tags: ['Guides'], summary: 'Download user guide PDF', responses: { 200: { description: 'OK' } } } }
    }
  };
}

module.exports = {
  buildOpenApiSpec
};
