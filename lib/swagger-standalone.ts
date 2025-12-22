/**
 * Standalone API Documentation Generator
 * Generates static API documentation independent of Next.js
 */

import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AEON API Documentation',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for AEON English Learning Platform',
      contact: {
        name: 'AEON Support',
        email: 'support@aeon.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://aeon.vercel.app',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Students',
        description: 'Student-specific endpoints for booking lessons and managing profile',
      },
      {
        name: 'Teachers',
        description: 'Teacher endpoints for managing lessons, availability, and profile',
      },
      {
        name: 'Lessons',
        description: 'Lesson booking and management endpoints',
      },
      {
        name: 'Resources',
        description: 'Educational resources and learning materials',
      },
      {
        name: 'Reviews',
        description: 'Teacher reviews and ratings',
      },
      {
        name: 'Users',
        description: 'User profile and account management endpoints',
      },
      {
        name: 'Admin',
        description: 'System administrator endpoints for analytics and management',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['student', 'teacher', 'admin'] 
            },
            is_verified: { type: 'boolean' },
            is_active: { type: 'boolean' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            username: { type: 'string' },
            full_name: { type: 'string' },
            date_of_birth: { type: 'string', format: 'date' },
            gender: { type: 'string' },
            phone: { type: 'string' },
            english_level: { 
              type: 'string',
              enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced', 'proficient']
            },
            learning_goals: { type: 'string' },
          },
        },
        Teacher: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            full_name: { type: 'string' },
            bio: { type: 'string' },
            specialization: { type: 'string' },
            years_of_experience: { type: 'integer' },
            hourly_rate: { type: 'number' },
            rating: { type: 'number' },
            total_reviews: { type: 'integer' },
            is_verified: { type: 'boolean' },
          },
        },
        Lesson: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            student_id: { type: 'integer' },
            teacher_id: { type: 'integer' },
            scheduled_date: { type: 'string', format: 'date' },
            scheduled_time: { type: 'string' },
            duration_minutes: { type: 'integer' },
            status: { 
              type: 'string',
              enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']
            },
            meeting_link: { type: 'string' },
            lesson_notes: { type: 'string' },
            homework: { type: 'string' },
          },
        },
        Resource: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            author_id: { type: 'integer' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            difficulty_level: { 
              type: 'string',
              enum: ['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced', 'proficient']
            },
            resource_type: {
              type: 'string',
              enum: ['article', 'video', 'audio', 'pdf', 'interactive']
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            errors: { 
              type: 'array',
              items: { type: 'string' }
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), 'app', 'api', '**', '*.ts'),
    path.join(process.cwd(), 'lib', 'swagger-annotations.ts')
  ],
};

// Generate the specification
const swaggerSpec = swaggerJsdoc(options);

// Create api-docs directory if it doesn't exist
const docsDir = path.join(process.cwd(), 'public', 'api-docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Write the OpenAPI spec as JSON
const specPath = path.join(docsDir, 'openapi.json');
fs.writeFileSync(specPath, JSON.stringify(swaggerSpec, null, 2));

console.log('OpenAPI specification generated at:', specPath);

// Generate standalone HTML documentation
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AEON API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
    .swagger-ui .info .title { 
      font-size: 2.5rem; 
      color: #523329;
    }
    .swagger-ui .info .description { 
      color: #6a4a3a; 
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: './openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      });
    };
  </script>
</body>
</html>`;

const htmlPath = path.join(docsDir, 'index.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('Standalone HTML documentation generated at:', htmlPath);
console.log('\nAPI Documentation ready!');
console.log('   - OpenAPI Spec: /public/api-docs/openapi.json');
console.log('   - Standalone UI: /public/api-docs/index.html');
console.log('   - Access at: http://localhost:3000/api-docs/index.html\n');

export default swaggerSpec;
