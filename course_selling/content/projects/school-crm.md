# 🏫 School CRM - Phase 1 (Next.js)

A complete School CRM foundation for managing students, staff, activities, and operations.

## 📋 Features (Phase 1)

### ✅ Implemented
- **Authentication**: JWT-based login system
- **User Management**: CRUD operations for staff/teachers
- **Student Management**: Complete student profiles
- **Student Remarks**: Behavioral and academic tracking
- **Student Activities**: Sports, cultural, competitions tracking
- **Director Reports**: Dashboard overview with key metrics
- **Role-Based Access**: Director, Principal, Admin, Manager, Teacher, Staff

### 📊 Database
- Schools
- Users (with roles)
- Students
- Admissions
- Fees
- Student Remarks
- Student Activities
- Staff Activities

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- npm or yarn

### 1️⃣ Database Setup

```bash
# Run the database schema
mysql -u your_user -p your_database < database/schema.sql

# Or connect to MySQL and run the schema manually
```

The schema file is located at: `database/schema.sql`

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# The .env file is already configured with your database credentials

# Create admin user (IMPORTANT!)
node scripts/createAdmin.js

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

Backend will run on: **http://localhost:8080**

### 3️⃣ Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Students
- `GET /api/students` - List students (with filters)
- `GET /api/students/:id` - Get student
- `POST /api/students` - Create student
- `PATCH /api/students/:id` - Update student

### Student Remarks
- `POST /api/students/:id/remarks` - Add remark
- `GET /api/students/:id/remarks` - Get remarks

### Student Activities
- `POST /api/students/:id/activities` - Add activity
- `GET /api/students/:id/activities` - Get activities

### Reports
- `GET /api/reports/overview` - Dashboard statistics

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Director** | View all data, oversight reports (read-only) |
| **Principal** | View students, activities, remarks, teacher activities |
| **Admin** | Full CRUD access (students, users, fees, admissions) |
| **Manager** | Full CRUD access (students, users, fees, admissions) |
| **Teacher** | Add remarks & activities for students |
| **Staff** | Profile exists, activities can be logged |

---

## 🏗️ Project Structure (Next.js)

```
school/
├── database/
│   └── schema.sql              # Complete database schema
│
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection
│   ├── middleware/
│   │   └── auth.js            # JWT + role check
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── students.routes.js
│   │   ├── remarks.routes.js
│   │   └── reports.routes.js
│   ├── scripts/
│   │   └── createAdmin.js     # Admin user generator
│   ├── .env                   # Environment variables
│   ├── index.js               # Server entry point
│   └── package.json
│
└── frontend/ (Next.js App Router)
    ├── app/
    │   ├── layout.js          # Root layout
    │   ├── page.js            # Home (redirects)
    │   ├── globals.css        # Global styles
    │   ├── login/
    │   │   └── page.js        # Login page
    │   └── dashboard/
    │       └── page.js        # Dashboard page
    ├── lib/
    │   └── api.js             # Axios + auth utilities
    ├── next.config.mjs
    ├── tailwind.config.js
    ├── jsconfig.json          # Path aliases (@/)
    └── package.json
```

---

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<admin-email>","password":"<admin-password>"}'

# Get students (with token)
curl http://localhost:8080/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Frontend
1. Open browser to http://localhost:3000
2. Should redirect to /login
3. Login with admin credentials
4. Should redirect to /dashboard
5. View dashboard with statistics
6. Test logout functionality

---

## 🔒 Security Notes

1. **Change default passwords** immediately after setup
2. **Update JWT_SECRET** in `backend/.env` to a strong random string
3. **Use HTTPS** in production
4. **Enable CORS** properly for your domain
5. **Implement rate limiting** for production
6. **Regular database backups**

---

## 🛣️ Phase 2 Roadmap

- Staff Activity Management (UI)
- Admissions Management (UI)
- Fees Management (UI)
- Advanced Reporting
- Bulk Operations
- Excel Import/Export
- Email Notifications
- WhatsApp Integration

---

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `backend/.env`
- Ensure database exists

### Cannot Login
- Run `createAdmin.js` script first
- Check backend console for errors
- Verify JWT_SECRET is set

### Frontend API Errors
- Ensure backend is running on port 8080
- Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- Open browser console for detailed errors

### Next.js Build Errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Ensure Node.js version is 18+

---

## 📝 Next.js Specific Notes

### SSR Considerations
- Authentication check runs on client-side only
- `localStorage` access is wrapped in `typeof window !== 'undefined'`
- All auth-dependent pages use `'use client'` directive

### Environment Variables
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Create `.env.local` file (gitignored by default)

### Path Aliases
- Use `@/` to import from root (configured in jsconfig.json)
- Example: `import api from '@/lib/api'`

---

## 📄 License

Private - School Management System

---

## 👨‍💻 Support

For issues or questions, contact your development team.

**Built with ❤️ for Modern School Management**
