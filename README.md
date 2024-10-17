# 🧳 trip_split

**trip_split** is a free alternative to the popular expense-splitting app, SplitWise. Inspired by the limitations of SplitWise, such as ads and the lack of free features, trip_split allows users to easily split expenses with friends. 

Splitwise is a popular app that enables consumers to share the costs of bills among friends. By ensuring that everyone who pays is reimbursed accurately and minimizing the number of transactions, Splitwise simplifies the expense-splitting process.

## 🌐 Live Site
Check out the live version of the application here: [Trip_Split Live Site](https://trips-split.netlify.app/)  

## 💼 Project Flow

1. **Login**: Users can securely log in to their accounts.
2. **Create a Trip**: Users can create a trip and select up to three different currencies to be used during the trip.
3. **Add Users**: Invite friends or group members to the trip.
4. **Add Expenses**: Expenses can be added in any of the three currencies chosen for the trip, which will then be converted into all currencies using **LIVE CURRENCY RATES** (a key feature).
5. **View Balances**: Users can see their balances, indicating the amounts they owe or are owed.
6. **Total Expenses**: View the total expenses for the trip and analyze, edit, or delete expenses as needed.

## 🛠️ Technologies Used
- **FrontEnd**: React (for UI)
- **Auth**: Firebase
- **Deployment**: Netlify (for hosting the application)

## 🛠️ Installation

### 📂 Cloning the Project

- **master** (Frontend): Contains the React-based frontend.
### Frontend (React) Setup

1. Clone the frontend code from the `master` branch:
   ```bash
   git clone -b master https://github.com/vidishraj/trip_split_ui.git
   cd FPL_Analysis
2. Install dependencies:
   ```bash
   npm install
3. Set your values in .env file <br></br>

4. Dont use the Auth Provider if you don't have firebase credentials or change the AuthProvider init values.
   ```bash
   interface AuthContextType {
    currentUser: User | null;
   }
   const AuthContext = createContext<AuthContextType>({ currentUser: null });
    ```
5. Start the application.
   ```bash
     npm start
   ```
  
## 🎯 Future Improvements
- Improve the overall UI and UX.
- Improve the re-login flow along with some bugs.
