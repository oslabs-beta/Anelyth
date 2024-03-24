import esquery from 'esquery';
import escodegen from 'escodegen';

const ASTDbQueryController = {};



// ------- CHECK DATABASE FUNCTION ------- //

function checkDatabase(fileAst, importPaths) {
  return importPaths.some(importPath => {
    const queryResult = esquery.query(
      fileAst,
      `VariableDeclarator[init.callee.name="require"][init.arguments.0.value="${importPath}"],
       CallExpression[callee.name="require"][arguments.0.value="${importPath}"],
       ImportDeclaration[source.value="${importPath}"][specifiers.0.local.name!="${importPath}"],
       CallExpression[callee.name="import"][arguments.0.type="Identifier"][arguments.0.value="${importPath}"],
       ImportDeclaration[source.value="${importPath}"][specifiers.length>1],
       ImportDeclaration[source.value="${importPath}"][specifiers.0.name!="${importPath}"],
       ImportDeclaration[source.value="${importPath}"][specifiers.0.type="ImportDefaultSpecifier"],
       ImportDeclaration[source.value="${importPath}"][specifiers.0.type="ImportNamespaceSpecifier"],
       CallExpression[callee.type="Import"][arguments.0.value="${importPath}"]`
    );

    console.log(`Checking for ${importPath}:`, queryResult.length > 0);

    return queryResult.length > 0;
  });
}   




// ----------- DATABASE HANDLER OBJECT ----------- //

    ASTDbQueryController.query = (req, res, next) => {
      try {
    
        // GET ASTs
        const { backendFileASTs } = res.locals;
    
        // DATABASE HANDLERS
        const databaseHandlers = {
          'MongoDB': {
            check: (ast) => checkDatabase(ast, ['mongoose', 'mongodb']),
            analyze: (ast, filePath) => analyzeMongoDBInteractions(ast, filePath)
          },
          'PostgreSQL': {
            check: (ast) => checkDatabase(ast, ['pg']),
            analyze: (ast, filePath) => analyzePostgreSQLInteractions(ast, filePath)
          },
          'SQL Server': {
            check: (ast) => checkDatabase(ast, ['mssql']),
            analyze: (ast, filePath) => analyzeSQLServerInteractions(ast, filePath)
          },
          'MySQL': {
            check: (ast) => checkDatabase(ast, ['mysql']),
            analyze: (ast, filePath) => analyzeMySQLInteractions(ast, filePath)
          },
          'SQLite': {
            check: (ast) => checkDatabase(ast, ['sqlite3']),
            analyze: (ast, filePath) => analyzeSQLiteInteractions(ast, filePath)
          },
          'Oracle': {
            check: (ast) => checkDatabase(ast, ['oracledb']),
            analyze: (ast, filePath) => analyzeOracleInteractions(ast, filePath)
          },
          'Redis': {
            check: (ast) => checkDatabase(ast, ['redis']),
            analyze: (ast, filePath) => analyzeRedisInteractions(ast, filePath)
          },
          'Firebase': {
            check: (ast) => checkDatabase(ast, ['firebase', 'firebase-admin']),
            analyze: (ast, filePath) => analyzeFirebaseInteractions(ast, filePath)
          },
          'DynamoDB': {
            check: (ast) => checkDatabase(ast, ['aws-sdk']),
            analyze: (ast, filePath) => analyzeDynamoDBInteractions(ast, filePath)
          },
          'Couchbase': {
            check: (ast) => checkDatabase(ast, ['couchbase']),
            analyze: (ast, filePath) => analyzeCouchbaseInteractions(ast, filePath)
          },
          'CouchDB': {
            check: (ast) => checkDatabase(ast, ['nano', 'pouchdb']),
            analyze: (ast, filePath) => analyzeCouchDBInteractions(ast, filePath)
          },
          'Neo4j': {
            check: (ast) => checkDatabase(ast, ['neo4j-driver']),
            analyze: (ast, filePath) => analyzeNeo4jInteractions(ast, filePath)
          },
          'ArangoDB': {
            check: (ast) => checkDatabase(ast, ['arangojs']),
            analyze: (ast, filePath) => analyzeArangoDBInteractions(ast, filePath)
          },
          'RethinkDB': {
            check: (ast) => checkDatabase(ast, ['rethinkdb']),
            analyze: (ast, filePath) => analyzeRethinkDBInteractions(ast, filePath)
          },
          'InfluxDB': {
            check: (ast) => checkDatabase(ast, ['influx']),
            analyze: (ast, filePath) => analyzeInfluxDBInteractions(ast, filePath)
          },
          'Elasticsearch': {
            check: (ast) => checkDatabase(ast, ['elasticsearch']),
            analyze: (ast, filePath) => analyzeElasticsearchInteractions(ast, filePath)
          },
          'Solr': {
            check: (ast) => checkDatabase(ast, ['solr-client']),
            analyze: (ast, filePath) => analyzeSolrInteractions(ast, filePath)
          },
          'Cassandra': {
            check: (ast) => checkDatabase(ast, ['cassandra-driver']),
            analyze: (ast, filePath) => analyzeCassandraInteractions(ast, filePath)
          },
          'HBase': {
            check: (ast) => checkDatabase(ast, ['hbase']),
            analyze: (ast, filePath) => analyzeHBaseInteractions(ast, filePath)
          },
          'Kafka': {
            check: (ast) => checkDatabase(ast, ['kafka-node', 'kafkajs']),
            analyze: (ast, filePath) => analyzeKafkaInteractions(ast, filePath)
          },
          'RabbitMQ': {
            check: (ast) => checkDatabase(ast, ['amqplib']),
            analyze: (ast, filePath) => analyzeRabbitMQInteractions(ast, filePath)
          },
          'SQS': {
            check: (ast) => checkDatabase(ast, ['aws-sdk']),
            analyze: (ast, filePath) => analyzeSQSInteractions(ast, filePath)
          },
          'Kinesis': {
            check: (ast) => checkDatabase(ast, ['aws-sdk']),
            analyze: (ast, filePath) => analyzeKinesisInteractions(ast, filePath)
          },
          'S3': {
            check: (ast) => checkDatabase(ast, ['aws-sdk']),
            analyze: (ast, filePath) => analyzeS3Interactions(ast, filePath)
          },
          'Azure Blob Storage': {
            check: (ast) => checkDatabase(ast, ['@azure/storage-blob']),
            analyze: (ast, filePath) => analyzeAzureBlobStorageInteractions(ast, filePath)
          },
          'Google Cloud Storage': {
            check: (ast) => checkDatabase(ast, ['@google-cloud/storage']),
            analyze: (ast, filePath) => analyzeGoogleCloudStorageInteractions(ast, filePath)
          },
          'Minio': {
            check: (ast) => checkDatabase(ast, ['minio']),
            analyze: (ast, filePath) => analyzeMinioInteractions(ast, filePath)
          }
        };
    
        // RUN EACH FILE THROUGH THE DATABASE HANDLERS
        backendFileASTs.forEach(fileObject => {
          const ast = fileObject.ast;
          const filePath = fileObject.filePath;
          console.log(`\nAnalyzing file: ${filePath}`);
        
          // CHECK AND ANALYZE DATABASE INTERACTIONS
          Object.keys(databaseHandlers).forEach(dbKey => {
            const handler = databaseHandlers[dbKey];
            if (handler.check(ast)) {
              const analysisResults = handler.analyze(ast, filePath); // Passing both AST and filePath
              console.log(`${dbKey} Analysis Results:`, analysisResults);
            }
          });
        });
    
        next();
      } catch (err) {
        console.error('Error in ASTDbQueryController.query:', err);
        return next({
          log: 'error in ASTDbQueryController.query',
          message: err,
        });
      }
    };




// ---- DATABASE ANALYSIS HELPER FUNCTIONS ---- //


// ANALYZE MONGO-DB INTERACTIONS
function analyzeMongoDBInteractions(fileAst, filePath) {
  console.log('Inside Mongoose Extended Analysis');

  // RELATED KEYWORDS
  const mongooseKeywords = [
    'mongoose', 'Schema', 'model', 'find', 'findOne', 'findById',
    'create', 'update', 'delete', 'aggregate', 'connect'
  ];

  let interactions = [];

  mongooseKeywords.forEach(keyword => {
    // DYNAMICALLY QUERY FOR KEYWORDS
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line; // LINE NUMBER
      interactions.push({ keyword, filePath, line });
    });
  });

  // RESULTS
  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE POSTGRESQL INTERACTIONS
function analyzePostgreSQLInteractions(fileAst, filePath) {
  console.log('Inside PostgreSQL Extended Analysis');

  // RELATED KEYWORDS
  const postgresKeywords = [
    'pg', 'Client', 'Pool', 'query', 'connect', 'disconnect',
    'transaction', 'execute', 'beginTransaction', 'commit', 'rollback'
  ];

  let interactions = [];

  postgresKeywords.forEach(keyword => {
    // DYNAMICALLY QUERY FOR KEYWORDS
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line; // LINE NUMBER
      interactions.push({ keyword, line });
    });
  });

  // RESULTS
  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE SQL SERVER INTERACTIONS
function analyzeSQLServerInteractions(fileAst, filePath) {
  console.log('Inside SQL Server Extended Analysis');

  // RELATED KEYWORDS
  const sqlServerKeywords = [
    'mssql', 'Connection', 'Request', 'query', 'execute',
    'pool', 'beginTransaction', 'commit', 'rollback', 'PreparedStatement'
  ];

  let interactions = [];

  sqlServerKeywords.forEach(keyword => {
    // DYNAMIC QUERY
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line; // Line number
      interactions.push({ keyword, line });
    });
  });

  // RESULTS
  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE MYSQL INTERACTIONS
function analyzeMySQLInteractions(fileAst, filePath) {
  console.log('Inside MySQL Extended Analysis');

  // RELATED KEYWORDS
  const mysqlKeywords = ['mysql', 'connection', 'query', 'execute', 'commit', 'rollback', 'connect', 'beginTransaction', 'pool', 
  'prepare', 'destroy', 'end', 'release', 'escape', 'format', 'createConnection', 'createPool', 'createPoolCluster', 'createPoolCluster',];

  let interactions = [];

  // DYANMIC QUERY
  mysqlKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  // RESULTS
  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE SQLITE INTERACTIONS
function analyzeSQLiteInteractions(fileAst, filePath) {
  console.log('Inside SQLite Extended Analysis');

  const sqliteKeywords = ['sqlite', 'sqlite3', 'db', 'run', 'get', 'all', 'exec', 'prepare', 'close', 'serialize', 'parallelize', 'open', 'each'];

  let interactions = [];

  sqliteKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE ORACLE INTERACTIONS
function analyzeOracleInteractions(fileAst, filePath) {
  console.log('Inside Oracle Extended Analysis');

  const oracleKeywords = ['oracledb', 'getConnection', 'execute', 'release', 'commit', 'rollback', 'close', 'prepare', 'bindParams', 'fetchInfo', 'createPool', 'prepareStatement'];

  let interactions = [];

  oracleKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE REDIS INTERACTIONS
function analyzeRedisInteractions(fileAst, filePath) {
  console.log('Inside Redis Extended Analysis');

  const redisKeywords = [
    'redis', 'createClient', 'set', 'get', 'del', 'exists', 
    'expire', 'publish', 'subscribe', 'unsubscribe', 'brpop', 'lpush'
  ];

  let interactions = [];
  redisKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE FIREBASE INTERACTIONS
function analyzeFirebaseInteractions(fileAst, filePath) {
  console.log('Inside Firebase Extended Analysis');

  const firebaseKeywords = [
    'firebase', 'initializeApp', 'auth', 'database', 'firestore', 
    'storage', 'Analytics', 'remoteConfig', 'messaging', 'getAuth', 'onAuthStateChanged', 'firebaseConfig', 'push', 'remove', 'orderBy', 'transaction', 'onDisconnect', 'setPersistenceEnabled', 'where', 'limit'
  ];

  let interactions = [];
  firebaseKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE DYNAMODB INTERACTIONS
function analyzeDynamoDBInteractions(fileAst, filePath) {
  console.log('Inside DynamoDB Extended Analysis');

  const dynamodbKeywords = [
    'DynamoDB', 'docClient', 'getItem', 'putItem', 'deleteItem', 
    'updateItem', 'scan', 'query', 'batchGetItem', 'batchWriteItem', 'createTable', 'deleteTable', 'table', 
  ];

  let interactions = [];
  dynamodbKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE COUCHBASE INTERACTIONS
function analyzeCouchbaseInteractions(fileAst, filePath) {
  console.log('Inside Couchbase Extended Analysis');

  const couchbaseKeywords = [
    'couchbase', 'Cluster', 'connect', 'bucket', 'collection', 
    'query', 'get', 'upsert', 'remove', 'N1qlQuery', 'getIndexes', 'createIndex', 'dropIndex', 'insert', 'replace', 
    'searchQuery', 'ViewQuery', 'SpatialViewQuery', 'AnalyticsQuery', 
    'MutationState', 'LookupInSpec', 'MutateInSpec', 'Counter'
  ];

  let interactions = [];
  couchbaseKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE COUCHDB INTERACTIONS
function analyzeCouchDBInteractions(fileAst, filePath) {
  console.log('Inside CouchDB Extended Analysis');

  const couchdbKeywords = [
    'nano', 'PouchDB', 'db', 'get', 'put', 'post', 'delete',
    'bulk', 'find', 'createIndex', 'use', 'replicate',
    'sync', 'changes', 'follow', 'design', 'view', 'fetch', 'attachment'
  ];


  let interactions = [];
  couchdbKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE NEO4J INTERACTIONS
function analyzeNeo4jInteractions(fileAst, filePath) {
  console.log('Inside Neo4j Extended Analysis');

  const neo4jKeywords = [
    'neo4j-driver', 'session', 'run', 'readTransaction', 'writeTransaction',
    'begin', 'commit', 'rollback', 'cypher', 'auth', 'driver',
    'close', 'acquireSession', 'execute', 'result', 'record', 'parameters', 'create', 'where'
  ];

  let interactions = [];
  neo4jKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE ARANGODB INTERACTIONS
function analyzeArangoDBInteractions(fileAst, filePath) {
  console.log('Inside ArangoDB Extended Analysis');

  const arangoDBKeywords = [
    'arangojs', 'Database', 'aql', 'query', 'collection', 
    'document', 'edge', 'transaction', 'Graph', 'bindVars',
    'createDatabase', 'dropDatabase', 'edgeCollection', 'index', 
    'createView', 'import', 'export', 'explain', 'cursor'
  ];

  let interactions = [];
  arangoDBKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE RETHINKDB INTERACTIONS
function analyzeRethinkDBInteractions(fileAst, filePath) {
  console.log('Inside RethinkDB Extended Analysis');

  const rethinkDBKeywords = [
    'rethinkdb', 'r', 'connect', 'table', 'get', 'run',
    'insert', 'filter', 'update', 'delete', 'changes', 'indexCreate',
    'indexDrop', 'orderBy', 'between', 'group', 'sum', 'avg', 'min', 'max'
  ];

  let interactions = [];
  rethinkDBKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE INFLUXDB INTERACTIONS
function analyzeInfluxDBInteractions(fileAst, filePath) {
  console.log('Inside InfluxDB Extended Analysis');

  const influxDBKeywords = [
    'InfluxDB', 'writePoints', 'query', 'createDatabase', 'deleteDatabase',
    'getDatabaseNames', 'createRetentionPolicy', 'dropRetentionPolicy', 'getMeasurements',
    'writeMeasurement', 'queryRaw', 'setDatabase', 'setRetentionPolicy'
  ];

  let interactions = [];
  influxDBKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE ELASTICSEARCH INTERACTIONS
function analyzeElasticsearchInteractions(fileAst, filePath) {
  console.log('Inside Elasticsearch Extended Analysis');

  const elasticsearchKeywords = [
    'elasticsearch', 'Client', 'search', 'index', 'delete', 'update',
    'bulk', 'create', 'get', 'mget', 'msearch', 'scroll', 'cluster', 
    'indices', 'aggs', 'aggregations', 'mapping'
  ];

  let interactions = [];
  elasticsearchKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE SOLR INTERACTIONS
function analyzeSolrInteractions(fileAst, filePath) {
  console.log('Inside Solr Extended Analysis');

  const solrKeywords = [
    'solr-client', 'createClient', 'search', 'add', 'delete', 'update', 
    'commit', 'rollback', 'query', 'facet', 'filterQuery', 'group', 'sort', 'ping',
    'optimize', 'spell', 'suggest', 'stats', 'highlight', 'terms', 'moreLikeThis'
  ];

  let interactions = [];
  solrKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE CASSANDRA INTERACTIONS
function analyzeCassandraInteractions(fileAst, filePath) {
  console.log('Inside Cassandra Extended Analysis');

  const cassandraKeywords = [
    'cassandra-driver', 'Client', 'execute', 'batch', 'connect', 'disconnect', 
    'query', 'prepare', 'eachRow', 'stream', 'getReplicas', 'shutdown', 'keyspace',
    'Mapper', 'Model', 'UDT', 'datatype', 'loadBalancing', 'reconnection', 'authProvider'
  ];

  let interactions = [];
  cassandraKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE HBASE INTERACTIONS
function analyzeHBaseInteractions(fileAst, filePath) {
  console.log('Inside HBase Extended Analysis');

  const hbaseKeywords = [
    'hbase-client', 'Table', 'get', 'put', 'delete', 'scan', 
    'batch', 'increment', 'checkAndPut', 'checkAndDelete', 'getRow', 'getFamily',
    'addColumn', 'addRow', 'createNamespace', 'deleteNamespace', 'listTables', 'filter'
  ];

  let interactions = [];
  hbaseKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE KAFKA INTERACTIONS
function analyzeKafkaInteractions(fileAst, filePath) {
  console.log('Inside Kafka Extended Analysis');

  const kafkaKeywords = [
    'kafka-node', 'KafkaClient', 'Producer', 'Consumer', 'send', 
    'fetch', 'offset', 'HighLevelProducer', 'HighLevelConsumer', 'SimpleConsumer',
    'createTopics', 'addBrokers', 'createPartitioner', 'keyedPartitioner', 'connect'
  ];

  let interactions = [];
  kafkaKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE RABBITMQ INTERACTIONS
function analyzeRabbitMQInteractions(fileAst, filePath) {
  console.log('Inside RabbitMQ Extended Analysis');

  const rabbitMQKeywords = [
    'amqplib', 'connect', 'createChannel', 'assertQueue', 'publish', 
    'consume', 'sendToQueue', 'ack', 'nack', 'prefetch', 'bindQueue',
    'assertExchange', 'deleteQueue', 'deleteExchange', 'close'
  ];

  let interactions = [];
  rabbitMQKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE SQS INTERACTIONS
function analyzeSQSInteractions(fileAst, filePath) {
  console.log('Inside SQS Extended Analysis');

  const sqsKeywords = [
    'aws-sdk', 'SQS', 'sendMessage', 'receiveMessage', 'deleteMessage', 
    'createQueue', 'deleteQueue', 'getQueueUrl', 'sendMessageBatch', 'purgeQueue',
    'listQueues', 'setQueueAttributes', 'getQueueAttributes', 'changeMessageVisibility'
  ];

  let interactions = [];
  sqsKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE KINESIS INTERACTIONS
function analyzeKinesisInteractions(fileAst, filePath) {
  console.log('Inside Kinesis Extended Analysis');

  const kinesisKeywords = [
    'aws-sdk', 'Kinesis', 'putRecord', 'putRecords', 'getRecords', 
    'createStream', 'deleteStream', 'describeStream', 'getShardIterator',
    'listStreams', 'splitShard', 'mergeShards'
  ];

  let interactions = [];
  kinesisKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE S3 INTERACTIONS
function analyzeS3Interactions(fileAst, filePath) {
  console.log('Inside S3 Extended Analysis');

  const s3Keywords = [
    'aws-sdk', 'S3', 'getObject', 'putObject', 'deleteObject', 
    'createBucket', 'deleteBucket', 'listBuckets', 'upload', 'download',
    'getSignedUrl', 'copyObject', 'listObjects', 'headObject'
  ];

  let interactions = [];
  s3Keywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE AZURE BLOB STORAGE INTERACTIONS
function analyzeAzureBlobStorageInteractions(fileAst, filePath) {
  console.log('Inside Azure Blob Storage Extended Analysis');

  const azureBlobStorageKeywords = [
    '@azure/storage-blob', 'BlobServiceClient', 'ContainerClient', 'BlobClient',
    'getBlobContainerClient', 'getBlobClient', 'upload', 'download', 'deleteBlob',
    'listBlobs', 'createContainer', 'deleteContainer', 'setMetadata', 'getProperties'
  ];

  let interactions = [];
  azureBlobStorageKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE GOOGLE CLOUD STORAGE INTERACTIONS
function analyzeGoogleCloudStorageInteractions(fileAst, filePath) {
  console.log('Inside Google Cloud Storage Extended Analysis');

  const gcsKeywords = [
    '@google-cloud/storage', 'Storage', 'bucket', 'file', 'upload', 
    'download', 'delete', 'getBuckets', 'getFiles', 'createReadStream',
    'createWriteStream', 'getSignedUrl', 'makePublic', 'move', 'copy'
  ];

  let interactions = [];
  gcsKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}

// ANALYZE MINIO INTERACTIONS
function analyzeMinioInteractions(fileAst, filePath) {
  console.log('Inside Minio Extended Analysis');

  const minioKeywords = [
    'minio', 'Client', 'makeBucket', 'removeBucket', 'listBuckets', 
    'putObject', 'getObject', 'removeObject', 'listObjects', 'presignedUrl',
    'presignedGetObject', 'presignedPutObject', 'statObject', 'copyObject',
    'getBucketPolicy', 'setBucketPolicy', 'getBucketNotification', 'listenBucketNotification'
  ];

  let interactions = [];
  minioKeywords.forEach(keyword => {
    const keywordExpressions = esquery.query(fileAst, [
      `Identifier[name="${keyword}"]`, 
      `Literal[value="${keyword}"]`,
      `MemberExpression[property.name="${keyword}"]`,
      `CallExpression[callee.name="${keyword}"]`
    ].join(','));

    keywordExpressions.forEach(expr => {
      const line = expr.loc.start.line;
      interactions.push({ keyword, line });
    });
  });

  let results = {
    filePath,
    totalInteractions: interactions.length,
    details: interactions
  };

  return results;
}





export default ASTDbQueryController;