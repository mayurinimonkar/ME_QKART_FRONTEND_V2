import { SentimentDissatisfied } from "@mui/icons-material";
import { Typography } from "@mui/material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";
import { Search } from "@mui/icons-material";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
import "./Products.css";


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [productObj, setproductObj] = useState([]);
  const [searchResult, setSearchResult] = useState(false);
  const [items, setItems] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  let token = localStorage.getItem("token");
  let tokenExists = (token && token !== '') ? true : false
  useEffect(()=>{
    const onLoadHandler = async()=>{
      const productsData = await performAPICall();
      const cartData = await fetchCart(localStorage.getItem("token"));

      if(productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
      
      
    }
  
    onLoadHandler();
   
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  // const productObj = 
  // [{
  // "name":"Tan Leatherette Weekender Duffle",
  // "category":"Fashion",
  // "cost":150,
  // "rating":4,
  // "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  // "_id":"PmInA797xJhMIPti"
  // }]

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try{
      setLoading(true);
      let response = await axios.get(config.endpoint + "/products")
      setproductObj(response.data)
      setLoading(false);
      return response.data;
    }catch(error){
      if(error.response && error.response.status === 400){
        enqueueSnackbar(error.response.data.message, { 
          variant: 'error',
          persist:false
        })
      }else{
        let message = "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
        enqueueSnackbar(message, { 
          variant: 'error',
          persist: false
        })
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
      setSearchResult(false)
      let response = await axios.get(`${config.endpoint}/products/search?value=${text}`) 
      setproductObj(response.data)
    }catch(error){
      
      if(error.response && error.response.data.length === 0 && error.response.status===404){
       setSearchResult(true)
      }else{
        let message = "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
        enqueueSnackbar(message, { 
          variant: 'error',
          persist: false
        })
      }
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if(debounceTimeout!==0){
      clearTimeout(debounceTimeout)
    }
     const newTimeout = setTimeout(()=>{
      performSearch(event.target.value)
     }, 500)

     setDebounceTimeout(newTimeout)
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
   const fetchCart = async (token) => {
    if (!token) return;
    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const configHeader = {Authorization: `Bearer ${token}`}
      let response = await axios.get(config.endpoint+ "/cart", {
        headers: configHeader
      })
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.some((item)=>item._id === productId);
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {


    if(!token)
    {
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
    }
  
    if(options.preventDuplicate && isItemInCart(items, productId )){
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning" });
    }else{
    
      try{
        const data = {
          productId : productId,
          qty: qty
        }
        const configHeader = {'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`}
        let response = await axios.post(config.endpoint + "/cart", data, {headers: configHeader} )
        const cartItems = generateCartItemsFrom(response.data,products)
        setItems(cartItems);
      }catch(error){
        if(error && (error.response.status === 400 || error.response.status === 401)){
          enqueueSnackbar(error.response.data.message, 
          { variant: "error" });
        }else{
          let message = "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
          enqueueSnackbar(message, 
            { variant: "error" });
        }
      }
    }

  };

  return (
    <div>
      <Header hasHiddenAuthButtons={false}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
         <TextField
                  type="search"
                  placeholder="Search for items/categories"
                  color='success'
                  size='small'
                  className="search-desktop"
                  InputProps={{
                    className:'search',
                    endAdornment: (
                      <InputAdornment position="end">
                          <Search color="success"/>
                      </InputAdornment>
                    ),
                  }}
                  onChange={
                   (e)=>debounceSearch(e, debounceTimeout)
              
                  }
                  variant="outlined"
                />
      </Header>

      {/* Search view for mobiles */}
      <TextField
                  type="search"
                  placeholder="Search for items/categories"
                  color='success'
                  size='small'
                  fullWidth
                  className="search-mobile"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                          <Search color="success"/>
                      </InputAdornment>
                    ),
                  }}

                  variant="outlined"
                  onChange={
                    (e)=>debounceSearch(e, debounceTimeout)
                  }
                />
      
    <Grid container spacing={2}>
        
        <Grid item md={tokenExists ? 9 : 12}>
              <Grid container>
                <Grid item className="product-grid">
                  <Box className="hero">
                    <p className="hero-heading">
                      India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                    to your door step
                    </p>
                  </Box>
                  {
                    searchResult? 
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{height: 500, width:'100%'}}><SentimentDissatisfied sx={{ mb: 2 }}/><Typography style={{ fontWeight: 400 }}>No products found</Typography></Box> 
                    : loading? 
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{height: 500, width:'100%'}}><CircularProgress sx={{ mb: 2 }}color="success"/><Typography style={{ fontWeight: 400 }}>Loading Products</Typography></Box> 
                    :
                    <Grid container marginY="1rem" paddingY="1rem" spacing={3}>
                      
                        {
                          productObj.map((productItem)=>(
                            <Grid item xs={6} md={3} key={productItem._id}>
                              <ProductCard product = {productItem} handleAddToCart={()=> addToCart( token,items,productObj,productItem._id,1, { preventDuplicate: true })}/>
                            </Grid>
                          ))
                        }
                   
                  </Grid>
                    
                  } 
                </Grid>
              </Grid>
        </Grid>
  
        {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
        <Grid item md={tokenExists ? 3 : 0}>
            {tokenExists ?<Cart products={productObj} items = {items} handleQuantity={addToCart} /> : <Box></Box>} 
        </Grid>

    </Grid>

       <Footer />
       </div>
  );
};

export default Products;
