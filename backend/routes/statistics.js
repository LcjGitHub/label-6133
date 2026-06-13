const express = require('express');
const { queryAll, queryOne } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const totalResult = queryOne('SELECT COUNT(*) AS total FROM stamps');
  const total = totalResult ? totalResult.total : 0;

  const byMaterial = queryAll(
    'SELECT material AS name, COUNT(*) AS value FROM stamps GROUP BY material ORDER BY value DESC'
  );

  const byYear = queryAll(
    'SELECT substr(carve_date, 1, 4) AS name, COUNT(*) AS value FROM stamps GROUP BY substr(carve_date, 1, 4) ORDER BY name ASC'
  );

  res.json({
    data: {
      total,
      byMaterial,
      byYear
    }
  });
});

module.exports = router;
