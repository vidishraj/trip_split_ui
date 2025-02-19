import "./BalanceContainer.scss";
import React,{useEffect, useState} from "react";
import { Avatar, Box, Typography, useTheme, Card } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { useTravel } from "../../Contexts/TravelContext";
import FunctionsIcon from '@mui/icons-material/Functions';

const BalanceContainer = () => {
  const travelCtx = useTravel();
  const theme = useTheme();
  const userBalances = travelCtx.state.balances;
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  useEffect(() => {
    let totalExpenditureLoc = 0;
    travelCtx.state.expenses.forEach((item: any) => {
      totalExpenditureLoc += item.amount;
    });
    setTotalExpenditure(totalExpenditureLoc);
  }, [travelCtx]);
  const getUserName = (userId:number) => {
    const user = travelCtx.state.users.find((u) => u.userId === userId);
    return user ? user.userName : "Unknown";
  };

  if (!userBalances || userBalances.length === 0) {
    return <Typography sx={{ textAlign: "center", mt: 2 }}>No Balance to show!</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", mt: 3}}>
      <Card
        sx={{
          width: '80%',
          maxWidth: 400,
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          [theme.breakpoints.down('sm')]: {
            padding: '12px',
          },
        }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              marginRight: '12px',
              backgroundColor: 'orange',
            }}
          >
            <FunctionsIcon />
          </Avatar>
          <Typography
            sx={{
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {'Total'}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontWeight: 'bold',
            color: totalExpenditure >= 0 ? '#4caf50' : '#f44336',
          }}
        >
          ₹ {totalExpenditure.toFixed(2)}
        </Typography>
      </Card>
      {userBalances.map((balance:any) => {
        const senderName = getUserName(balance.from);
        const receiverName = getUserName(balance.to);

        return (
          <Box
            key={`${balance.from}-${balance.to}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:'space-evenly',
              gap: 2,
              backgroundColor: "white",
              boxShadow: 2,
              borderRadius: 3,
              padding: 2,
              minWidth:'320px',
              width: "550px",
              margin: "auto",
            }}
          >
            {/* Sender */}
            <Box sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "rgb(244, 67, 54)", width: 56, height: 56, fontSize: 24 }}>
                {senderName[0] || "U"}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1, color:'rgb(244, 67, 54)' }}>
                {senderName}
              </Typography>
            </Box>

            {/* Arrow with Amount */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "rgb(76, 175, 80)" }}>
                ₹ {balance.amount.toFixed(2)}
              </Typography>
              <ArrowForward sx={{ fontSize: 36, color: "black" }} />
            </Box>

            {/* Receiver */}
            <Box sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "rgb(76, 175, 80)", width: 56, height: 56, fontSize: 24 }}>
                {receiverName[0] || "U"}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1,color:"rgb(76, 175, 80)" }}>
                {receiverName}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default BalanceContainer;
