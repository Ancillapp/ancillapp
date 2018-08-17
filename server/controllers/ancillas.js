const { Router } = require('express');
const bucket = require('../services/storage');
const router = new Router();

router.get('/', async (req, res) => {
  const [files] = await bucket.getFiles({
    prefix: 'ancillas',
    delimiter: 'thumbs',
  });
  res.json({
    status: 200,
    data: files.slice(1).map(({ name }) => name.slice(9, 16)),
  });
});

router.get('/:yyyymm', (req, res) => {
  bucket
    .file(`ancillas/${req.params.yyyymm}.pdf`)
    .createReadStream()
    .on('error', () => {
      res.status(404).json({
        status: 404,
        data: 'Not Found',
      });
    }).pipe(res);
});

module.exports = router;
