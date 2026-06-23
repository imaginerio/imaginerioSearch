/* eslint-disable no-console, no-await-in-loop */
const { ApiKey } = require('@esri/arcgis-rest-auth');
const { queryFeatures } = require('@esri/arcgis-rest-feature-layer');
const { request } = require('@esri/arcgis-rest-request');

const FEATURE_SERVER =
  'https://services.arcgis.com/lqRTrQp2HrfnJt8U/arcgis/rest/services/imagineRio_GDB/FeatureServer';
const PAGE_SIZE = 2000;
const MIN_PAGE_SIZE = 50;

const getAuth = () => {
  const key = process.env.ARCGIS_API_KEY;
  if (!key) throw new Error('ARCGIS_API_KEY env var is required');
  return new ApiKey({ key });
};

const listLayers = async () => {
  const { layers } = await request(`${FEATURE_SERVER}/layers`, {
    authentication: getAuth(),
    params: { f: 'json' },
  });
  return layers;
};

const forEachPage = async (layerId, { where, outFields = ['*'], onPage, label }) => {
  const url = `${FEATURE_SERVER}/${layerId}`;
  const auth = getAuth();
  const tag = label || `layer ${layerId}`;
  let offset = 0;
  let pageSize = PAGE_SIZE;

  for (;;) {
    let response;
    for (;;) {
      try {
        console.log(`${tag}: fetching offset=${offset} size=${pageSize}`);
        response = await queryFeatures({
          url,
          where,
          outFields,
          resultRecordCount: pageSize,
          resultOffset: offset,
          returnGeometry: true,
          f: 'geojson',
          authentication: auth,
        });
        break;
      } catch (err) {
        if (pageSize <= MIN_PAGE_SIZE) throw err;
        const next = Math.max(MIN_PAGE_SIZE, Math.floor(pageSize / 2));
        console.log(
          `${tag}: page failed at offset=${offset} size=${pageSize} (${err?.message ?? err}); retrying with size=${next}`
        );
        pageSize = next;
      }
    }
    const features = response.features || [];
    if (features.length === 0) break;
    await onPage(features, offset);
    if (!response.exceededTransferLimit) break;
    offset += features.length;
  }
};

module.exports = { FEATURE_SERVER, listLayers, forEachPage };
