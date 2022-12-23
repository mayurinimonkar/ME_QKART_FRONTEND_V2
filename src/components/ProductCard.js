import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    //<div className="product-card-div">
      
              <Card className="card">
              <CardMedia component="img" image={product.image} />
              <CardContent className="card-content">
              <Typography gutterBottom variant="subtitle2" component="div">
               {product.name}
               </Typography>
               <Typography gutterBottom variant="subtitle1" style={{ fontWeight: 600 }}>
                ${product.cost}
               </Typography>
               <Rating name="read-only" value={product.rating} sx={{ mb: 1 }} readOnly />
              </CardContent>
              <CardActions>
                <Button variant="contained" value={product._id} fullWidth onClick={handleAddToCart}><AddShoppingCartOutlined sx={{ mr: 1 }} />ADD TO CART</Button>
              </CardActions>
            </Card>
            
    //</div>
  );
};

export default ProductCard;
