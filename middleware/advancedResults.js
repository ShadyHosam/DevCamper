
const advancedResults = (model , populate) => async(req,res,next) =>{
     
    let query;

    const reqQuery = {...req.query};
  
    // fields we want to remove from the request query 
    const removeFields = ['select','sort','page','limit'];
  
  
    // we have to loop over remove fields and remove them from the query
    removeFields.forEach(param =>delete reqQuery[param]);
    
   
  
    // Convert reqQuery to a string and apply regex
      let queryStr = JSON.stringify(reqQuery);
    queryStr= queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match =>`$${match}`);
  
  
      // Convert string back to JSON and query DB
    query = model.find(JSON.parse(queryStr));
  
  
    // Handle "select" fields properly
    if (req.query.select){
      const fields = req.query.select.split(',').join(' ');
      console.log(fields);
      query = query.select(fields);
      
    }
  
    //Sorting
  
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' '); 
        query = query.sort(sortBy);
    }
    else{
      query = query.sort('createdAt');
    }
  
  // Pagination
  
  const page = parseInt(req.query.page,10) || 1;
  const limit = parseInt(req.query.limit,10) || 25;
  
  const startingIndex  = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startingIndex).limit(limit);

    if (populate){
        query = query.populate(populate);
    }


    const results = await query;
    // pagination results
    const pagination ={};
    if (endIndex < total){
      pagination.next = {
        page:page+1,
        limit
      }
    }
    if (startingIndex> 0){
      pagination.prev = {
        page:page - 1,
        limit
      }
    }
    res.advancedResults = {
        success:true,
        count:results.length,
        pagination,
        data:results
    }
    next();

}

module.exports = advancedResults;