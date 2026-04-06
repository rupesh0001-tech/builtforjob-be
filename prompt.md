# using bun prisma postgres typescript 


use the latest docs of prisma 
for email services use resend ( use the latest docs for resend too )

I will add  keys soo just maintain a env file 

make a docs folder in the parent folder 
docs <--------- here 
BE
FE
docs > backend > auth docs > put all auth apis guide here with what input is being taken and what is response 


folder stuct
    middlewares > subfolders 
    routes > sub folders 
    controllers > subfolders 
    config > all configs subfolders like ai, email service, bla bla ,
    services > all the reptrative tasks functions such as sendEmail, generate jwt, hass pass , otp etc 
    interfaces > contains all the interfaces 
    app.ts 

make a register and login end points with jwt auth, and a high level email otp services 
routes to be made 
/user/register 
/user/login
/user/forget/password 
/verify/otp
/profile ===== {get req}


architecture 

when user wants to resgitser ==> fills info ==> get otp ==> verifys otp ==> get token ==> registers 

when user login ==> fills info ==> correct info ==> login 

forget ==> gets a reset pass link on email ==> passupdated 






