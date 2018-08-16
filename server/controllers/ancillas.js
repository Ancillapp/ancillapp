const { Router } = require('express');
const bucket = require('../services/storage');
const router = new Router();

router.get('/', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({
      prefix: 'ancillas',
    });
    res.json({
      status: 200,
      data: files.slice(1).map(({ name }) => name),
    });
  } catch (e) {
    res.status(500).json({
      status: 500,
      data: 'Internal Server Error',
    });
  }
});

router.get('/:yyyymm', (req, res) => {
  try {
    bucket
      .file(`ancillas/${req.params.yyyymm}.pdf`)
      .createReadStream()
      .on('error', () => {
        res.status(404).json({
          status: 404,
          data: 'Not Found',
        });
      }).pipe(res);
  } catch (e) {
    res.status(500).json({
      status: 500,
      data: 'Internal Server Error',
    });
  }
});

module.exports = router;
