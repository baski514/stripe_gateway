const stripe = require('stripe')('sk_test_51JGIo1SBpHKZJ9YR3S6ZddcbJnmL7vhbFkH6v3razColNsgqKJAG7TQnKDHypfXtQFvjQgr0DpYCdUJxegIPf64X00NHpx1296');
const express = require('express');
const app = express();
const path = require ('path');

app.use(express.static('.'));
app.use (express.json ());


const YOUR_DOMAIN = 'http://localhost:3000/checkout';
const endpointSecret = 'whsec_h...';

app.use (express.static (path.join (__dirname, './Client/build')));

app.get ('/', (req, res) => {
  res.sendFile (path.join (__dirname, './build/index.html'));
});



app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',

    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  })
  res.redirect(303, session.url)

  console.log(session)
});

app.post ('/paymentSuccess', async (req, res) => {
  const {product, token} = req.body;

  await stripe.customers
    .create ({
      email: token.email,
    })
    .then (customer => {
      const body = {
        token: token,
        customer: customer,
        product: product,
      };
      console.log (body);
      return res.status (200).json (body);
    })
    .catch (error => res.status (400).json ({error: error}));
});

app.post('/webhooks',async(req,res)=>{
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    }
    catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

})

app.listen(4242, () => console.log('Running on port 4242'));