import tSNE from '../../src/dash/TSNE'

import { UMAP } from 'umap-js';

test('Test tSNE > ', async () => {


    var opt = {}
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tSNE(opt); // create a tSNE instance

    // initialize data. Here we have 3 points and some example pairwise dissimilarities
    var dists = [[1.0, 0.1, 0.2], [0.1, 1.0, 0.3], [0.2, 0.1, 1.0]];
    tsne.initDataDist(dists);

    for (var k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
    }

    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    expect(Y.length).toBe(3)
  


})

test('Test UMAP', () => {

    const data = [[1.0, 0.1, 0.2], [0.1, 1.0, 0.3], [0.2, 0.1, 1.0]];
    const umap = new UMAP({
        nComponents: 2,
        nEpochs: 400,
        nNeighbors: 2,
      });
    const embedding = umap.fit(data);
    console.debug(embedding)
})