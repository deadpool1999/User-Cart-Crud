# User Cart CRUD Operations

## Installation

```
git clone https://github.com/deadpool1999/User-Cart-Crud.git
cd User-Cart-Crud
npm install
npm start
```

Server is running on port 3001. Can be changed from config.

## Testing API

use the postman collection: https://www.getpostman.com/collections/318f305b878957f4cbde

open the collection in postman and start making requests according to following flow:

### Create User

`POST /users/`: Set the bearer token got from it.

use already existing creds: 
token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDhlYzYyZWYxODJlNDQ0YTg3ZWZlMjkiLCJpYXQiOjE2MTk5Njk1ODN9.qaA0GW996mPnxEOp8ug6CXZCzWAUrN-mcXB-pds2iPw
```

### Create New Item

> Does not require authentication

already existing item ids: 

```
608ec9ef96f37a396c0186f8
608ec68bf182e444a87efe2b
608ec7a9f182e444a87efe2d
```

`POST /items/`

### Push items to cart

> requires authentication

`POST /users/cart/:item_id`

### Increment Decrement existing item

> requires authentication

`PATCH /users/cart/:item_id/:type`

type: INC/DEC

### Remove item 

> requires authentication

`DELETE /users/cart/:item_id`

### Remove all cart items

> requires authentication

`DELETE /users/cart/`

