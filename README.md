# PoPConnect 🚀  
**This App is designed to connect people looking for partners to collaborate on projects, workouts, learning journeys, or shared living arrangements. Built to help individuals who share goals and passions, fostering meaningful connections and collaborations.**


## 🌟 Overview

PoPConnect is built with Next.js, leveraging Firebase for authentication, database, and analytics to ensure a secure and scalable backend. The app integrates blockchain tools for advanced features and smart contract support, including a unique Proof-of-Participation (PoP) badge system that enhances trust and authenticity within the platform.


## 📁 Project Structure

- **app/** – Handles all frontend routes, pages, and UI logic using Next.js App Router.
- **components/** – Reusable UI components like cards, maps, modals, and 3D landing visuals.
- **lib/** – Core logic and services including chat, explore/matching, profiles, and Web3 integrations.
- **smart-contracts/** – Contains Solidity smart contracts, Hardhat configs, and deployment scripts.


## ✨ Key Features

🔍 **Skill-Based Matching**: Discover people with shared goals — from hackathons to roommates — using swipe-based discovery.

🧾 **DID & PoP Badge Verification**: Ensure authentic identities and participation via decentralized identity and soulbound NFTs.

🫂 **Community Servers**: Join topic-specific servers to connect, collaborate, and stay updated with like-minded people.


## 🛠️ Tech Stack

### Frontend
- **Next.js + React** (UI framework)
- **TailwindCSS** (styling)
- **TypeScript** (type safety)

### Backend & Services
- **Firebase** (authentication, database, analytics)
- **React Query** (data fetching)

### Blockchain & Web3
- **Hardhat** (smart contract development)
- **Solidity** (smart contracts)
- **wagmi + RainbowKit** (wallet integration)


## 🚀 Project Setup Instructions

### Prerequisites
- **Node.js 18+** and npm installed
- **Firebase project** with authentication and Firestore enabled
- **MetaMask** or other Web3 wallet for blockchain features
- **Git** for version control

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/homie-finder.git
   cd homie-finder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # WalletConnect Configuration
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

   # Hardhat Configuration (for smart contracts)
   # You can use any testnet provider: Infura, Alchemy, QuickNode, etc.
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
   PRIVATE_KEY=your_deployment_wallet_private_key
   ```

4. **Configure Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Enable Analytics
   - Copy your configuration to `.env.local`

5. **Set up blockchain development:**
   ```bash
   cd smart-contracts
   npm install
   ```

6. **Deploy smart contracts (optional):**
   ```bash
   npx hardhat compile
   
   # Using Hardhat Ignition
   npx hardhat ignition deploy ignition/modules/PoP.js --network sepolia
   
   # OR using traditional deployment script (if you have one)
    npx hardhat run scripts/deploy.js --network sepolia
   ```

7. **Run the development server:**
   ```bash
   npm run dev
   ```

8. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Integration

The app uses Firebase for:

- **Authentication**: Email/password and Google sign-in methods
- **Firestore**: Primary database for user data, chats, events, and app content
- **Analytics**: User behavior tracking and app performance monitoring
- **Real-time updates**: Live chat and user status updates

## ⛓️ Smart Contract Configuration

### Deployment
- **Network**: Sepolia testnet (for development)
- **Framework**: Hardhat with OpenZeppelin contracts
- **Integration**: Frontend integration with wagmi and RainbowKit

## 🚀 Future Enhancements
### 1. PoP Badge Verification UI 
Implement a verification system where users can issue Proof-of-Participation (PoP) badges to others. A badge (NFT) is granted only after one user verifies another, ensuring credibility and reducing spam accounts.

### 2. Trending Events Explorer
Integrate an external events API to display the latest trending events happening nearby. Users will be able to explore and join events relevant to their interests and location.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the MugenMinds team**
