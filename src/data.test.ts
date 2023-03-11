import { generateGeohashes, valueGeneratorGenerator } from './data'
import * as d3 from 'd3';

test('generates random data', () => {
  const data = [
    { 
      seed: 'test',
      expected: 0.3543756501749158
    },
    { 
      seed: 'test2',
      expected: 0.9787943207193166
    }
  ]

  data.forEach(x => {
    const valueGenerator = valueGeneratorGenerator(x.seed)
    expect(valueGenerator()).toBe(x.expected)
  })
})

test('generates geohash data', () => {
  const data = [
    { 
      zoom: 1,
      bbox: [-90, -180, 90, 180],
      expected: ["0", "1", "4", "5", "h", "j", "n", "p", "2", "3", "6", "7", "k", "m", "q", "r", "8", "9", "d", "e", "s", "t", "w", "x", "b", "c", "f", "g", "u", "v", "y", "z"]
    },
    { 
      zoom: 3,
      bbox: [-10, -10, 0, 0],
      expected: ["7y", "7z"]
    },
    { 
      zoom: 5,
      bbox: [-5, -5, 0, 0],
      expected: ["7zh", "7zj", "7zn", "7zp", "7zk", "7zm", "7zq", "7zr", "7zs", "7zt", "7zw", "7zx", "7zu", "7zv", "7zy", "7zz"]
    }
  ]

  data.forEach(x => {
    const geohashes = generateGeohashes(x.zoom, x.bbox)
    expect(geohashes).toHaveLength(x.expected.length)
    expect(geohashes).toEqual(x.expected)
  })
});

test('interpolate colors', () => {
    const data = [
        { 
            value: 0.0,
            expected: [165, 0, 38],
        },
        {
            value: 0.5,
            expected: [249, 247, 174]
        },
        {
            value: 1.0,
            expected: [0, 104, 55]
        }
    ]

    data.forEach(x => {
        const result = d3.interpolateRdYlGn(x.value).split('(')[1].split(')')[0].split(',').map(n => Number(n))
        expect(result).toEqual(x.expected)
    })
})