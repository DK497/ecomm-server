const ejwt=require('express-jwt');

function authjwt(){
    const api=process.env.some_url
    const secret=process.env.secret;
    // returns ejwt as function
    return ejwt({
        secret,
        algorithms:['HS256'],
        isRevoked:isRevoked
    }).unless({
        path: [
            {url: /\/public\/upload(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]  
    })
}

async function isRevoked(req,payload,done){
    if(!payload.isAdmin)
    {done(null,true)}
     
    done()

}

module.exports=authjwt