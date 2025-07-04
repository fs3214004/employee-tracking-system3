# Employee Tracking System - Riyadh

نظام تتبع الموظفين في الوقت الفعلي مخصص لشركة توزيع اشتراكات الإنترنت في الرياض، المملكة العربية السعودية.

## متطلبات النظام

- Node.js 18+ 
- PostgreSQL 12+
- npm أو yarn

## إعداد قاعدة البيانات

### الخيار 1: PostgreSQL محلي

```bash
# تثبيت PostgreSQL على نظام Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# إنشاء مستخدم وقاعدة بيانات
sudo -u postgres psql
CREATE USER employee_tracker WITH PASSWORD 'your_password';
CREATE DATABASE employee_tracker_db OWNER employee_tracker;
GRANT ALL PRIVILEGES ON DATABASE employee_tracker_db TO employee_tracker;
\q
```

### الخيار 2: Neon (مُوصى به)

1. اذهب إلى [Neon Console](https://console.neon.tech/)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد
4. انسخ DATABASE_URL من لوحة التحكم

## تثبيت البرنامج

```bash
# استنساخ المشروع
git clone [repository-url]
cd employee-tracking-system

# تثبيت المكتبات
npm install

# نسخ ملف المتغيرات البيئية
cp .env.example .env

# تحرير ملف البيئة
nano .env
```

## ملف .env

أنشئ ملف `.env` في المجلد الرئيسي واملأه بالمعلومات التالية:

```bash
# إعداد قاعدة البيانات
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# وضع التطوير/الإنتاج
NODE_ENV=development

# مفتاح الجلسة (اختياري)
SESSION_SECRET=your-secret-key-here

# منفذ الخادم (افتراضي: 5000)
PORT=5000
```

### أمثلة DATABASE_URL:

```bash
# PostgreSQL محلي
DATABASE_URL=postgresql://employee_tracker:your_password@localhost:5432/employee_tracker_db

# Neon (مُوصى به)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require

# موفري الخدمة السحابية الأخرى
DATABASE_URL=postgresql://user:password@hostname:5432/database_name?sslmode=require
```

## تشغيل البرنامج

```bash
# تشغيل في وضع التطوير
npm run dev

# تشغيل في وضع الإنتاج
npm run build
npm run start
```

## الوصول للبرنامج

بعد تشغيل البرنامج، يمكنك الوصول إليه عبر:

- **وضع التطوير**: http://localhost:5000
- **وضع الإنتاج**: http://localhost:5000

## الميزات الرئيسية

- تتبع الموظفين في الوقت الفعلي
- خريطة تفاعلية مع أكثر من 100 موظف
- واجهة عربية مع دعم RTL
- تصفية حسب المنطقة والمدينة والحي
- إضافة الملاحظات على الخريطة
- عرض تفاصيل الموظفين (اللغات والدورات التدريبية)

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات

```bash
# تحقق من DATABASE_URL
echo $DATABASE_URL

# تحقق من الاتصال بقاعدة البيانات
npm run db:check
```

### خطأ في المنفذ

```bash
# تحقق من المنفذ المستخدم
lsof -i :5000

# إيقاف العملية إذا كانت مستخدمة
kill -9 [PID]
```

## الدعم

إذا واجهت مشاكل في الإعداد، تحقق من:
1. تثبيت Node.js 18+
2. الاتصال بقاعدة البيانات
3. صحة ملف .env
4. تثبيت جميع المكتبات: `npm install`

## الهيكل التقني

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + Shadcn/UI
- **Maps**: Leaflet.js