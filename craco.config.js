module.exports = {
    plugins: [
      
    ],
    webpack: {
      configure: (config, { env, paths }) => {
        // config.module.rules.push({
        //   test: /\.svg$/,
        //   use: ["@svgr/webpack"]
        // });
        return config;
      }
    }
  };