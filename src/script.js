/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const w = 1200;
const h = 770;
const legendItems = [];

// Define the tooltip here
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const svg = d3.select('main').append('svg').attr('width', w).attr('height', h);

const color = [
  '#D4D8CC',
  '#968AD7',
  '#4192DA',
  '#84D1D8',
  '#CE7DD8',
  '#B158D9',
  '#BDD8C9',
  '#9DD89C',
  '#C9BDD8',
  '#D270D8',
  '#D8C18B',
  '#B8D979',
  '#BDD8AF',
  '#81D9BD',
  '#7CD9AC',
  '#D2D8CA',
  '#D97054',
  '#CAD887',
  '#B0B9D9',
];

const colorScale = d3.scaleOrdinal(color);

d3.json(
  'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
).then((data) => {
  // Define the treemap here
  const treemap = d3
    .treemap()
    .tile(d3.treemapResquarify)
    .size([w, h])
    .round(true)
    .paddingInner(1)
    .paddingOuter(1);

  const root = d3
    .hierarchy(data)
    .eachBefore((d) => {
      d.data.id = (d.parent ? `${d.parent.data.id}.` : '') + d.data.name;
      if (d.parent && d.children) {
        legendItems.push(d);
      }
    })
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const cell = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', (d) => `translate(${d.x0},${d.y0})`)
    .on('mousemove', (d, i) => {
      const { name, category, value } = d.data;
      const [x, y] = [d3.event.pageX, d3.event.pageY];
      tooltip
        .style('opacity', 0.9)
        .style('top', `${y - 28}px`)
        .style('left', `${x + 10}px`)
        .attr('data-value', value);
      tooltip.html(
        `${category} <br> ${name} <br>$${value
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
      );
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  cell
    .append('rect')
    .attr('class', 'tile')
    .attr('id', (d) => d.data.id)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('fill', (d) => colorScale(d.data.category))
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value);

  cell
    .append('foreignObject')
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .append('xhtml:p')
    .attr('width', (d) => d.x1 - d.x0)
    .attr('min-height', (d) => d.y1 - d.y0)
    .style('margin-top', '3px')
    .style('font-family', 'Arial')
    .style('font-size', '12px')
    .text((d) => d.data.name);

  // Define the legend here
  const legend = d3
    .select('body')
    .append('svg')
    .attr('id', 'legend')
    .attr('width', 200)
    .attr('height', h - 4)
    .attr('fill', 'rgb(223, 223, 223)')
    .style('background-color', '#333');

  const legends = legend.selectAll('g').data(legendItems).enter().append('g');

  legends
    .append('rect')
    .attr('width', 40)
    .attr('height', 30)
    .attr('x', 0)
    .attr('y', (d, i) => i * 39.7)
    .attr('fill', (d, i) => colorScale(d.data.name));

  const legendText = legends
    .selectAll('text')
    .data(legendItems)
    .enter()
    .append('text')
    .attr('x', 48)
    .attr('y', (d, i) => i * 39.7 + 21)
    .text((d) => d.data.name);
});
