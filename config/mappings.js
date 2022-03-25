module.exports = {
  highways: {
    folders: [
      {
        name: 'Urbanism',
        layers: [
          'RoadsLine',
          'UtilitiesLine',
          'WaterWorksPoly',
          'OpenSpacesPoly',
          'BoundariesPoly',
        ],
        defaultFolder: true,
      },
      {
        name: 'Landscape',
        layers: ['HidrographyLine', 'GroundCoverPoly', 'HidrographyPoly'],
      },
    ],
    document: [
      { db: 'ssid', remote: 'image_id' },
      { db: 'artstor', remote: 'artstor_id' },
    ],
    feature: [{ db: 'namealt', remote: 'nameshort' }],
  },
  rio: {
    document: [
      { db: 'ssid', remote: ['notes', 'ss_id'] },
      { db: 'artstor', remote: 'ssc_id' },
    ],
    feature: [{ db: 'namealt', remote: 'nameshort' }],
    folders: [
      {
        name: 'Urbanism',
        layers: [
          'PhysicalPoint',
          'BuildingsPoly',
          'UtilitiesLine',
          'PublicSpacesPoly',
          'UtilitiesPoly',
          'NeighborhoodsPoly',
          'RoadsLine',
        ],
        defaultFolder: true,
      },
      {
        name: 'Landscape',
        layers: [
          'InlandWatersLine',
          'GroundCoverPoly',
          'InlandWatersPoly',
          'CoastLine',
          'LandPoly',
        ],
      },
    ],
  },
};
