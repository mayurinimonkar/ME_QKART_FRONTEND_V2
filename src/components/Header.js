import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  
    const history = useHistory();

    const handleLogout = () =>{
      localStorage.clear()
      window.location.reload()
    }
    let buttons;
    if(hasHiddenAuthButtons){
      buttons = <Button
      className="explore-button"
      startIcon={<ArrowBackIcon />}
      variant="text"
      onClick={(e)=>{
        history.push("/")
      }}
    >
      Back to explore
    </Button>
    }else{
  
      let altStatus = localStorage.getItem("username");
      let token = localStorage.getItem("token");
      if( token && token !== ''){
        buttons = <Box display= "flex" alignItems="center">
        <img src="avatar.png" alt={altStatus}></img>{localStorage.getItem("username")}
       <Button onClick = {handleLogout}>LOGOUT</Button></Box>
      }else{
        buttons= <Box><Button variant="text" onClick={()=>{history.push("/login")}}>LOGIN</Button>
      <Button variant="contained" onClick={()=>{history.push("/register")}}>REGISTER</Button></Box>
      }
      
    }

    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children}
        {buttons}
      </Box>
    );
};

export default Header;
