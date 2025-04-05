import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import HomeIcon from "@mui/icons-material/Home";
import CalculateIcon from '@mui/icons-material/Calculate';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ChecklistIcon from '@mui/icons-material/Checklist';
import PlagiarismIcon from '@mui/icons-material/Plagiarism';

import { useNavigate } from "react-router-dom";

export default function Sidemenu({ open, toggleDrawer }) {
  const navigate = useNavigate();

  const listOptions = () => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <List>
        <ListItemButton onClick={() => navigate("/home")}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={() => navigate("/simulation")}>
          <ListItemIcon>
            <MonetizationOnIcon />
          </ListItemIcon>
          <ListItemText primary="Simular Crédito" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/mcapplication")}>
          <ListItemIcon>
            <RequestQuoteIcon />
          </ListItemIcon>
          <ListItemText primary="Solicitar Crédito" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/evaluation")}>
          <ListItemIcon>
            <PlagiarismIcon />
          </ListItemIcon>
          <ListItemText primary="Evaluar Crédito" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/tracking")}>
          <ListItemIcon>
            <ChecklistIcon />
          </ListItemIcon>
          <ListItemText primary="Seguimiento de Solicitudes" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/calculateAnnualCosts")}>
          <ListItemIcon>
            <CalculateIcon />
          </ListItemIcon>
          <ListItemText primary="Calcular Costos Totales" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer anchor={"left"} open={open} onClose={toggleDrawer(false)}>
        {listOptions()}
      </Drawer>
    </div>
  );
}
