import { hierarchy } from 'd3';
import fs from 'fs';
import path from 'path';

D3Controller = {};


//take dependency cruiser output and build a tree for D3 input
//input: tree
//output: another tree
D3Controller.buildTree = (req, res, next) => {
  // res.locals.depResult (dependency-cruiser json)
  // {
  //   'modules': [
  //     {
  //       'source': 'string',
  //       'dependencies': [
  //         {
  //           'module': 'string',
  //           'moduleSystem': 'string',
  //           'dynamic': boolean,
  //           'exoticallyRequired': boolean,
  //           'dependencyTypes': [
  //             'strings'
  //           ],
  //           'resolved': string,
  //           'coreModule': boolean,
  //           'followable': boolean,
  //           'couldNotResolve': boolean,
  //           'matchesDoNotFollow': boolean,
  //           'circular': boolean,
  //           'valid': boolean
  //         }
  //       ],
  //       'dependents': [
  //         'strings'
  //       ]
  //       'orphan': boolean,
  //       'valid': boolean
  //     }
  //   ],
  //   'summary': {
  //     stuff in here
  //   }
  // }
  // res.locals.hierarchy (file hierarchy tree that gets passed into D3)


};



