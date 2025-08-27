# 🌾 RBW Farms Reimagined

A modern, mobile-first farm investment platform built with Next.js, TypeScript, and Firebase. This application allows users to invest in various farming opportunities and manage their investments through an intuitive Bengali-language interface.

## ✨ Features

### 🏠 **User Dashboard**
- **Investment Opportunities**: Browse and purchase farm investment packages
- **Balance Management**: Track withdrawal and recharge balances
- **Investment History**: View all past investments and earnings
- **Daily Income Claims**: Claim daily returns from active investments

### 💰 **Financial Features**
- **Multi-level Commission System**: 15%, 3%, 2% commission structure
- **Bonus System**: Daily bonus claiming with 50% return
- **Recharge/Withdrawal**: Complete payment management system
- **Transaction History**: Detailed transaction tracking

### 👥 **Team Management**
- **Referral System**: Invite friends with referral codes
- **Team Statistics**: View team performance and earnings
- **Commission Tracking**: Monitor referral commissions

### 🔧 **Admin Panel**
- **User Management**: Complete user administration
- **Transaction Monitoring**: Real-time transaction oversight
- **Investment Settings**: Manage investment packages
- **Payment Methods**: Configure payment options
- **Site Content**: Dynamic banner and content management

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Firebase Realtime Database, Firebase Auth
- **Deployment**: Vercel-ready
- **Language**: Bengali (বাংলা) with English support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rbw-farms.git
   cd rbw-farms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile-First Design

The application is designed with a mobile-first approach, featuring:
- Responsive design for all screen sizes
- Touch-optimized interface
- Native app-like experience
- Bottom navigation for easy access
- Optimized images and performance

## 🔐 Security Features

- **Authentication**: Secure user login/registration
- **Data Validation**: Input validation and sanitization
- **Firebase Security Rules**: Database security
- **Protected Routes**: Admin and user route protection

## 📊 Database Structure

### Users Collection
```javascript
{
  id: "uid_mobileNumber",
  mobileNumber: "01XXXXXXXXX",
  fullName: "User Name",
  password: "hashed_password",
  balance: 0,
  rechargeBalance: 0,
  totalIncome: 0,
  teamCommission: 0,
  investments: {},
  referralCode: "12345",
  referrerId: "referrer_user_id",
  registrationDate: "2024-01-01T00:00:00.000Z"
}
```

### Investments Structure
```javascript
{
  id: "investment_id",
  title: "Investment Title",
  price: 1000,
  dailyIncome: 50,
  cycle: 30,
  totalIncome: 1500,
  image: "image_url",
  quotaCurrent: 1,
  quotaMax: 1
}
```

## 🎨 UI Components

Built with a comprehensive component library:
- **Cards**: Investment cards, balance cards
- **Forms**: Login, registration, payment forms
- **Navigation**: Bottom navigation, admin sidebar
- **Modals**: Confirmation dialogs, payment modals
- **Charts**: Investment performance charts
- **Tables**: Transaction history, user management

## 🌐 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@rbwfarms.com or create an issue in this repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added admin panel and enhanced UI
- **v1.2.0** - Mobile optimization and performance improvements

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling
- Radix UI for accessible components
- All contributors and beta testers

---

**Made with ❤️ for the farming community**
