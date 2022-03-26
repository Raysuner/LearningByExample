const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const cors = require('cors')
const path = require('path');
const fs = require('fs');
const fsp = fs.promises

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const publicDir = path.join(__dirname, "../public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }
    cb(null, publicDir);    // 保存的路径，备注：需要自己创建
  },
  filename: function (req, file, cb) {
    // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
    cb(null, file.originalname);
  }
});

// 通过 storage 选项来对 上传行为 进行定制化
const upload = multer({ storage: storage })
const app = express();
app.use(cors())

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.post('/formDataUpload', upload.array('files', 12), (req, res, next) => {
  res.json({ msg: '上传成功' })
})

app.post('/base64Upload', (req, res, next) => {
  const dataList = Object.keys(req.body)
  dataList.forEach((data) => {
    const parseData = JSON.parse(data)
    const { fileName, fileData } = parseData
    const base64Data = decodeURIComponent(fileData).replace(/^data:image\/png;base64,/, '')

    const publicDir = path.resolve('public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir)
    }
    const filePath = path.resolve(publicDir, fileName)
    fsp.writeFile(filePath, base64Data, 'base64')
  })
  res.json({ msg: '上传成功' })
})

app.listen(8080)