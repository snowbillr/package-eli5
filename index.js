const jsonfile = require('jsonfile');
const request = require('request-promise-native');

jsonfile.readFile(resolvePackageJsonPath(), (err, obj) => {
  const dependencies = extractDependencies(obj);

  Promise.all(fetchDescriptionsForDependencies(dependencies)).then(descriptionList => {
    const dependencyDescriptions = zipToObject(dependencies, descriptionList);

    console.log(dependencyDescriptions);
  });
});

function resolvePackageJsonPath() {
  const passedInPath = process.argv[2];
  if (passedInPath == null) {
    return './package.json';
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