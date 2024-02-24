import { cruise, } from "dependency-cruiser";

const DCController = {};

// const cruiseOptions = {
//   includeOnly: "FFSS-OSP",
// };

  DCController.analyze = async (req, res, next) => {
    try{
      console.log('in dccontroller.analyze');
      const result = await cruise([])
      // console.log(result);
      console.dir(result.output, { depth: 10 });
      return next();
    } catch (err) {
      return next(err)
    }
  }

export default DCController;