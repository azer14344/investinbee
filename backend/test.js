const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let cars = [];
const app = express();

/*
body-parser - is a middleware that populate the request object with "body" (req.body)
      if we don't use body-parser, we will be listening to the packets of data coming to
      the server and save it on a variable chunk by chunk. This middleware make our life
      easier! No need to re-invent the wheel :D
cors - is a middleware that gives power to the server (our api) to whitelist origin
      (example of origins are https://www.facebook.com, http://localhost:3000)
      Cors uses http header to do its job.
      https://www.codecademy.com/articles/what-is-cors
*/

/*
  to use a middleware the syntax is app.use("your middleware")
  I forgot to explain what is a middleware T_T
  You can think of the middleware as a additional process of data before
  the data reaches your endpoints (GET /api/cars and so on)
  In our example, this is the journey of our request (api call)
  1. We check if the request origin belong to the whitelisted origins (in our case, we allow any origin 😲)
  2. We check if our request have a "body" (body should only be used on POST, PATCH, PUT, and DELETE)
  3. The request will go to the corresponding endpoint
  Of course you can make your own middleware (app.use(jairusMiddleware()))
  Middleware also can be use on a specific endpoint
  app.get(middleware1(), '/api/cars', function (req, res) {});
  app.get(middleware1(), middleware2(), '/api/cars', function (req, res) {}); <- you could also add more
  What can you do your custom middleware?
  1. Authenticate the request (return status 401 if request failed authentication)
  2. Authorize the request (example only role: admin can access a particular endpoint) (return 403 if not authorize)
  3. Put your validation rules (path parameter, query parameter, or body) per endpoint
    "app.get(validateQueryParams(), 'api/cars', function(req, res) {})"
  4. and many more!
*/
app.use(cors()); // doing this "cors()", we are allowing all origin. https://www.npmjs.com/package/cors

app.use(bodyParser.json()); // doing this "bodyParser.json()", we are expecting to receive the body in json

app.get('/api/cars', function (req, res) {
  try {
    let carList = cars;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
    const shallowCopyOfCar = Array.from(cars);

    if (req.query.sort) { // desc or asc
      carList = shallowCopyOfCar.sort(function (car1, car2) {
        if (req.query.sort === 'asc') {
          return car1.price - car2.price;
        }

        return car2.price - car1.price;
      });
    }

    // res.status(200) => setting our response status to 200
    //                    this also return the "res" object. with this we can chain functions
    // res.json() =>  setting our response json object, response as a json is on of the most
    //                  popular ways to create an api

    res.status(200).json({
      message: 'Successfully retrieved cars',
      cars: carList,
    });
  } catch (error) {
    // you should always know when you code will have an error
    // it is a bad api design to not know vulnerabilities
    console.error(error); // logging the error

    // return 500 the famous "Internal Server Error"
    res.status(500).json({message: 'Failed to retrieve cars'});
  }
});

app.post('/api/cars', function (req, res) {
  try {
    console.log(req.body);

    cars.push(req.body);

    res.status(201).json({
      message: 'Successfully created a car',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({message: 'Failed to create a car'});
  }
});

app.patch('/api/cars/:id', function (req, res) {
  try {
    // sorry during the demo I was asserting using "===", I should have used isNaN()

    /*
    > Number('a') === NaN // false
    > isNaN('a') // true
    NaN = Not a Number
    */

    // this should work na! ^^
    if (isNaN(req.params.id)) {
      res.status(400).json({
        message: 'Invalid id path parameter:' + req.params.id,
      });
    }

    console.log(req.params)
    console.log(req.body);

    // map -> iterate on each element of an array and return the same size of an array
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

    cars = cars.map(function (car) {
      if (car.id === req.params.id) {
        return {
          id: car.id,
          name: car.name,
          price: req.body.price,
        };
      }

      return car;
    });

    console.log(cars);

    res.status(200).json({
      message: 'Successfully updated a car:' + req.params.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({message: 'Failed to update a car'});
  }
});

app.put('/api/cars/:id', function (req, res) {
  try {
    console.log(req.params)
    console.log(req.body);

    cars = cars.map(function (car) {
      if (car.id === req.params.id) {
        return {
          id: car.id,
          name: req.body.name,
          price: req.body.price,
        };
      }

      return car;
    });

    console.log(cars);

    res.status(200).json({
      message: 'Successfully updated a car:' + req.params.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({message: 'Failed to update a car'});
  }
});

app.delete('/api/cars/:id', function (req, res) {
  try {
    console.log(req.params)

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

    cars = cars.filter(function (car) {
      if (car.id === req.params.id) {
        return false;
      }
      return true;
    });

    console.log(cars);

    res.status(200).json({
      message: 'Successfully deleted a car:' + req.params.id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({message: 'Failed to delete a car'});
  }
});

const PORT = 8080; // the port where our api will be served

// running this will serve our api, to run use "npm start"
app.listen(PORT, function () {
  console.log('Example app listening at http://localhost:' + PORT);
});