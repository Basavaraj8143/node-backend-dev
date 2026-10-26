const fs=require('fs/promises');
async function readFile(){
    try{
        const data=await fs.readFile('test-data.txt','utf-8');
        console.log(data);
    }catch(err){
        console.error(err);
    }

}
readFile();