 
const express=require('express');
const dotenv=require('dotenv').config();
const port=process.env.PORT || 5000;
const cors=require('cors');
const {MongoClient,ServerApiVersion}=require('mongodb');
const axios=require('axios');

const uri = "mongodb+srv://dua99:oCOnVHR8DOyvkHek@aravind9927.8ffpotm.mongodb.net/?retryWrites=true&w=majority";
 

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
const dbName = "roxiler";
const collectionName = "roxiler_collection";

// Create references to the database and collection in order to run
// operations on them.
const database = client.db(dbName);
const collection = database.collection(collectionName);


const app =express();
const corsOptions = {
  origin: '*', // Allow requests from this origin
  methods:'*',      // Allow specified HTTP methods
  allowedHeaders:'*', // Allow specified headers
};

 app.use(cors(corsOptions));

const options = {projection: {  _id:0,id:1,title:1,price:1,description:1,category:1,image:1,sold:1,dateOfSale:1 } };

app.get('/getTransactions',cors(),async (req,res)=>{
  try{
    await client.connect();
    await client.db("admin").command({ ping: 1 });
  
   
         /*   
      try {
        const result = await collection.insertMany(changed,{ ordered: true });
        // add a linebreak
        console.log(result);
      } catch (err) {
        console.error(`Something went wrong trying to find the documents: ${err}\n`);
      } */
       const  { search="", month  } = req.query;
      const  queryToDatabase=search ?
        {  $and:[
                {
                  $or: [
                        { title: { $regex: new RegExp(`^${search}$`, 'i') } }, // Case-insensitive search on title
                        { description: { $regex: new RegExp(`^${search}$`, 'i')} }, // Case-insensitive search on description
                        { price:new RegExp(`^${parseFloat(search)}$` )  || 0 } // Match exact price if provided
                      ]
                    }
                    ,
                    {dateOfSale:Number(month)}
            ]
            }:
             month?{dateOfSale:Number(month)}:{};
        
      if(queryToDatabase.hasOwnProperty("$and")){  console.log(queryToDatabase.$and[0].$or[2].price,"This is the query getting passed");}
      
       const cursor =await   collection.find(queryToDatabase, options);
       await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
            let data=[];
            for await(const doc of cursor){
           data.push(doc);}
            res.json(data);
 
    }catch(err){
      console.log(err);
    }
});

 

app.get('/getBarChart',cors(),async (req,res)=>{
  const month=req.query.month;
   
 
  // Insert data into MongoDB
  const Statement= {dateOfSale:Number(month)} 
   try{
    await client.connect();
    await client.db("admin").command({ ping: 1 });
  
    const cursor =await collection.find(Statement,options);
    await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
    
    let bars={"0-100":0,"101-200":0,"201-300":0,"301-400":0,"401-500":0,"501-600":0,"601-700":0,"701-800":0,"801-900":0,"901_above":0}
              for await(const data of cursor){
            
             if(data.price<=100){
              bars["0-100"]+=1;
          }
          else if(data.price>100 && data.price<=200){
              bars["101-200"]+=1;
          }
          else if(data.price>200 && data.price<=300){
              bars["201-300"]+=1;
          }
          else if(data.price>300 && data.price<=400){
              bars["301-400"]+=1;
          }
          else if(data.price>400 && data.price<=500){
              bars["401-500"]+=1;
          }
          else if(data.price>500 && data.price<=600){
              bars["501-600"]+=1;
          }
          else if(data.price>600 && data.price<=700){
              bars["601-700"]+=1;
          }
          else if(data.price>700 && data.price<=800){
              bars["701-800"]+=1;
          }
          else if(data.price>800 && data.price<=900){
              bars["801-900"]+=1;
          }
          else if(data.price>900){
              bars["901_above"]+=1;
          }
            }
              await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
              res.json(bars);
    
   }
   catch(err){
    console.log(err);
   }
   finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  });

  app.get('/getStatistics',cors(),async (req,res)=>{
    const month=req.query.month;
    // Insert data into MongoDB
    const Statement= {dateOfSale:Number(month)} 
    try{
        await client.connect();
        await client.db("admin").command({ ping: 1 });
    
        const cursor =await collection.find(Statement,options);
        await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
        let data=[];
                for await(const doc of cursor){
               data.push(doc);
              }
              
              const totalSoldItems=data.filter(item=>item.sold).reduce((accumulator)=>accumulator+1,0);
              const totalNotSoldItems=data.filter(item=>!item.sold).reduce((accumulator)=>accumulator+1,0);
              const totalSales=data.filter(item=>item.sold).reduce((accumulator,currentValue)=>accumulator+currentValue.price,0).toFixed(2);
              await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
            res.json({totalSales,totalSoldItems,totalNotSoldItems});
      
     }
     catch(err){
      console.log(err);
     }
     finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    
    });
    
    app.get('/getPieChart',cors(),async (req,res)=>{
      const month=req.query.month;
       
     
      // Insert data into MongoDB
      const Statement= {dateOfSale:Number(month)} 
       try{
        await client.connect();
        await client.db("admin").command({ ping: 1 });
      
        const cursor =await collection.find(Statement,options);
        await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
        
        const  pieChart={ };
                  for await(const data of cursor){
                        if(pieChart.hasOwnProperty(data.category)){
                            pieChart[data.category]+=1;
                        }
                        else{
                            pieChart[data.category]=1;
                        }
                
                }
                await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),500));
                  res.json(pieChart);
        
       }
       catch(err){
        console.log(err);
       }
       finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
      });

      app.get('/getCombinedData',cors(),async (req,res)=>{
        const month=req.query.month;

        try{
         
            const [transactions,statistics,barChart,pieChart]=await Promise.all([axios.get(`http://localhost:8000/getTransactions?month=${month}`),
                                                                                 axios.get(`http://localhost:8000/getStatistics?month=${month}`),
                                                                                 axios.get(`http://localhost:8000/getBarChart?month=${month}`),
                                                                                 axios.get(`http://localhost:8000/getPieChart?month=${month}`)]);
                     await new Promise(resolve=>setTimeout(()=>resolve("this is for loading time"),1000));
                     res.json({"transactions":transactions.data, "statistics":statistics.data, "barChart":barChart.data, "pieChart":pieChart.data});
          
         }
         catch(err){
          console.log(err);
         }
         finally {
            // Ensures that the client will close when you finish/error
            await client.close();
          }
        
        
        });
 

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
});

 
