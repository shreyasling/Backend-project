const express=require("express");
const router=express.Router();
const{githubController}=require("../controllers")

router.get("/user",githubController.githubUser)

router.get("/allusers",githubController.allgithubUsers)

router.get("/getAllUser",githubController.getAllUsers)

module.exports=router;