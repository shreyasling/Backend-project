const APIURL="https://api.github.com/users";

const axios = require('axios');
const User=require("../models/Data")


const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const cron = require('node-cron');
const fs = require('fs');

const githubUser=async(req,res,next)=>{
    try {
        const {username}=req.body;
       
        const response=await fetch(APIURL+"/"+username);
        
        res.status(200).json({code:200,status:true,message:"User get successfully ",data:await response.json()})
        
    } catch (error) {
        next(error);
    }
}
const allgithubUsers=async(req,res,next)=>{
    const since = req.query.since || 0;
    const url = `https://api.github.com/users?since=${since}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 'Authorization': `token ` // Replace with your GitHub token
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    return [];
  }
}

async function fetchGitHubUsers(since = 0) {
    const url = `https://api.github.com/users?since=${since}`;
    try {
      const response = await axios.get(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            // 'Authorization': `token ` // Replace with your GitHub token
          }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data from GitHub:', error);
      return [];
    }
  }
  
  // Save data to MongoDB
  async function saveUserData(users) {
    try {
      for (const userData of users) {
        const existingUser = await User.findOne({ id: userData.id });
        if (existingUser) {
          await User.updateOne({ id: userData.id }, userData);
          console.log('User data updated:', userData.login);
        } else {
          const user = new User(userData);
          await user.save();
          console.log('User data saved:', userData.login);
        }
      }
    } catch (error) {
      console.error('Error saving data to MongoDB:', error);
    }
  }
  
  // Save data to Excel
  async function saveDataToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('GitHub Users');
  
    worksheet.columns = [
      { header: 'Login', key: 'login', width: 20 },
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Node ID', key: 'node_id', width: 30 },
      { header: 'Avatar URL', key: 'avatar_url', width: 50 },
      { header: 'Gravatar ID', key: 'gravatar_id', width: 30 },
      { header: 'URL', key: 'url', width: 50 },
      { header: 'HTML URL', key: 'html_url', width: 50 },
      { header: 'Followers URL', key: 'followers_url', width: 50 },
      { header: 'Following URL', key: 'following_url', width: 50 },
      { header: 'Gists URL', key: 'gists_url', width: 50 },
      { header: 'Starred URL', key: 'starred_url', width: 50 },
      { header: 'Subscriptions URL', key: 'subscriptions_url', width: 50 },
      { header: 'Organizations URL', key: 'organizations_url', width: 50 },
      { header: 'Repos URL', key: 'repos_url', width: 50 },
      { header: 'Events URL', key: 'events_url', width: 50 },
      { header: 'Received Events URL', key: 'received_events_url', width: 50 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Site Admin', key: 'site_admin', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Company', key: 'company', width: 30 },
      { header: 'Blog', key: 'blog', width: 30 },
      { header: 'Location', key: 'location', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Hireable', key: 'hireable', width: 10 },
      { header: 'Bio', key: 'bio', width: 50 },
      { header: 'Twitter Username', key: 'twitter_username', width: 30 },
      { header: 'Public Repos', key: 'public_repos', width: 15 },
      { header: 'Public Gists', key: 'public_gists', width: 15 },
      { header: 'Followers', key: 'followers', width: 15 },
      { header: 'Following', key: 'following', width: 15 },
      { header: 'Created At', key: 'created_at', width: 25 },
      { header: 'Updated At', key: 'updated_at', width: 25 },
    ];
  
    try {
      const filePath = './github_users.xlsx';
      if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
        console.log('Existing file loaded');
      }
  
      const users = await User.find();
      users.forEach(user => {
        worksheet.addRow(user.toObject());
      });
  
      await workbook.xlsx.writeFile(filePath);
      console.log('Data saved to Excel file');
    } catch (error) {
      console.error('Error saving data to Excel:', error);
    }
  }
  
  // Main function
  const getAllUsers=async (req,res,next)=>{
    try{
        let since = 0;
    let users;
  
    do {
      users = await fetchGitHubUsers(since);
      await saveUserData(users);
      since = users.length > 0 ? users[users.length - 1].id : 0;
    } while (users.length > 0);
  
    await saveDataToExcel();
   
    mongoose.connection.close();
  }
  catch(error){
    next(error)
  }
}
  // Schedule daily updates
//   cron.schedule('0 2 * * *', () => {
//     console.log('Running the daily update at 2 AM');
//     main();
//   });

module.exports={githubUser,allgithubUsers,getAllUsers}