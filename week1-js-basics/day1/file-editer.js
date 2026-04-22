const fs=require('fs/promises');
async function writeFile(){
    try{
        await fs.writeFile('test-data.txt','Hello, World!');
        console.log('File written successfully');
    }catch(err){
        console.error(err);
    }
}
writeFile();