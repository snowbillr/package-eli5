const jsonfile = require('jsonfile');
const request = require('request-promise-native');
const colors = require('colors/safe');
const path = require('path');

jsonfile.readFile(resolvePackageJsonPath(), (err, obj) => {
  const dependencies = extractDependencies(obj);

  Promise.all(fetchDescriptionsForDependencies(dependencies)).then(descriptionList => {
    const dependencyDescriptions = zipToObject(dependencies, descriptionList);

    printDescriptions(dependencyDescriptions);
  });
});

function resolvePackageJsonPath() {
  const passedInPath = process.argv[2];
  if (passedInPath == null) {
    return './package.json';
  } else if (!/package\.json$/.test(passedInPath)) {
    return path.join(passedInPath, 'package.json');
  } else {
    return passedInPath;
  }
}

function extractDependencies(obj) {
  return Object.keys(obj.dependencies);
}

function fetchDescriptionsForDependencies(dependencies) {
  return dependencies.map(dependency => {
    return fetchDescription(dependency);
  });
}

function fetchDescription(dependency) {
  return request({
    uri: `https://registry.npmjs.org/${dependency}`,
    json: true,
  }).then(response => {
    return response.description;
  });
}

function zipToObject(array1, array2) {
  return array1.reduce((obj, value, index) => {
    obj[value] = array2[index];
    return obj;
  }, {});
}

function printDescriptions(dependencyDescriptions) {
  const banner = colors.rainbow('Package ELI5');

  const output = Object.keys(dependencyDescriptions).map(dependency => {
    const description = dependencyDescriptions[dependency];
    return `${colors.green(dependency)}: ${colors.white(description)}`;
  }).join('\n');

  console.log(banner);
  console.log(output);
}