import ngeohash from 'ngeohash'

const zoomPrecisionMap = {
    0: 1,
    1: 1,
    2: 2,
    3: 3,
    4: 3
}

// thanks stackoverflow
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

export const valueGeneratorGenerator = (seed?: string) => {
    const seedFunc = seed ? xmur3(seed) : Math.random
    const rand = sfc32(seedFunc(), seedFunc(), seedFunc(), seedFunc());

    return rand
}

export const generateGeohashes = (zoom: number, boundingbox: number[]) => {
    
    const precision = zoom in zoomPrecisionMap ? zoomPrecisionMap[zoom] : 1
    const [s, w, n, e] = boundingbox

    const geohashes = ngeohash.bboxes(s, w, n, e, precision)

    return geohashes
}