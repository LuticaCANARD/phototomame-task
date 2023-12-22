import { fabric } from "fabric";
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from "sharp";
const __dirname = dirname(fileURLToPath(import.meta.url));
// 설정을 위한 통일된 규격임...
const size_width = 1821;
const size_height = 1024;
// const size_width = 3840;
// const size_height = 2160;
const count_row = 2;
const count_col = 1;
// 아틀라싱 툴임. 다만, 유니티 내에서 편집가능하면 패스해도됨.
for(let time=0;time<14;time++){
  for(let stream=0;stream<1;stream++){
    const canvas = new fabric.StaticCanvas(null, {width: size_width*count_col, height: size_height*count_row})
    const promiseArray = []
    for(let row=0;row<count_row;row++){
      let callRow = row+1;
      const file = await fs.readdirSync(`./origin/${stream}/canvas${callRow}`);
      for(let col=0;col<count_col;col++){
        const p = new Promise((resolve) => {
          fabric.Image.fromURL('file://'+__dirname+`/origin/${stream}/canvas${callRow}/${file[time]}`,(oImg)=>{
            oImg.set({ 
              id : 'image_'+row+'_'+col,
              left:col*size_width,
              top:row*size_height,
              opacity: 1,      
            })
            oImg.scaleToHeight(size_height);
            oImg.scaleToWidth(size_width);
            canvas.add(oImg);
            resolve();
          })
        });
        promiseArray.push(p);
      }
    }
    Promise.all(promiseArray)
      .then(() => {
        canvas.renderAll();
        canvas.createPNGStream().pipe(sharp().png({quality:50,force:true}))
        .pipe(fs.createWriteStream(`./docs/output${stream}_${time}.png`)).close();
        console.log('END;');
      })
  }
  
}

