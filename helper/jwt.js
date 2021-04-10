const ejwt=require('express-jwt');
// this api is used to secure api in server


function authjwt(){
    const api=process.env.some_url
    const secret=process.env.secret;
    // returns ejwt as function
    // jwt token send to backend is verified 
    return ejwt({
        secret,algorithms:['HS256'],isRevoked:isRevoked
    }).unless({
        // token is not required for accessing these endpoints
        path: [
            {url: /\/public\/upload(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/users\/.*/,methods: ['GET']},
            { url: /\/api\/v1\/orders/,methods: ['POST','GET']},
            { url: /\/api\/v1\/payment/,methods: ['POST','GET']},
            { url: /\/api\/v1\/payment(.*)/,methods: ['POST','GET']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]  
    })
}

async function isRevoked(req,payload,done){
    // token received contains .isAdmin as well as id info
    if(!payload.isAdmin)
    {
        // reject token
        done(null,true)
    }
     
    done()

}

module.exports=authjwt