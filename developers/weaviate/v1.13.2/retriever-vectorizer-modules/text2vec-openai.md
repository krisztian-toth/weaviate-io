---
layout: layout-documentation
solution: weaviate
sub-menu: Retrievers & Vectorizers
title: text2vec-openai
description: Use any OpenAI model inside Weaviate
tags: ['text2vec-openai']
menu-order: 3
open-graph-type: article
toc: true
callout: This is the most recent Weaviate module that leverages an external API. We would love to know how you use it, especially on large-scale implementations. Connect with us on Slack <a href="https://join.slack.com/t/weaviate/shared_invite/zt-goaoifjr-o8FuVz9b1HLzhlUfyfddhw">here</a>.
redirect_from:
    - /developers/weaviate/current/modules/text2vec-openai.html
---

# Introduction

The `text2vec-​openai` module allows you to use the [OpenAI embeddings](https://beta.openai.com/docs/guides/embeddings) directly in the Weaviate vector search engine as a vectorization module. ​When you create a Weaviate class that is set to use this module, it will automatically vectorize your data using OpenAI's Ada, Babbage, Curie, or Davinci models.

💡 [Check-out the demo dataset](https://github.com/semi-technologies/DEMO-text2vec-openai)

_Note I: make sure to check the OpenAI [pricing page](https://openai.com/api/pricing/) before vectorizing large amounts of data_

_Note II: Weaviate automatically parallelizes requests to the OpenAI-API when using the batch endpoint, see the previous note_

# How to use

​Using the OpenAI module within Weaviate requires you to create an OpenAI API key. You can create a key [here](https://beta.openai.com/account/api-keys).

To test if your key has access to the embedding API, you can run the following command in your terminal.

```sh
$ curl https://api.openai.com/v1/engines/text-search-ada-query-001/embeddings \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "​Is Weaviate the coolest vector search engine?"}'
```

### OpenAI Rate Limits

Because you will be getting embeddings based on your own API key, you will be dealing with rate limits applied to your account. If you have a low rate limit set, Weaviate will output the error message generated by the OpenAI API.

##### Request a higher rate or removal of your limit

You can request to increase your rate limit by emailing OpenAI directly on `support@openai.com` describing your use case with Weaviate.

##### Throttle the import inside your application

If you run into rate limits, you can also decide to throttle the import in your application.

E.g., in Python and Java using the Weaviate client.

{% include code/1.x/text2vec-openai.example.html %}

The current rate limit will be displayed in the error message like: 

```json
{
  "message": "Rate limit reached for requests. Limit: 600.000000 / min. Current: 1024.000000 / min. Contact support@openai.com if you continue to have issues."
}
```

### Example Docker-compose file

You can find an example Docker-compose file below, which will spin up Weaviate with the OpenAI module.

```yaml
version: '3.4'
services:
  weaviate:
    image: semitechnologies/weaviate:{{ site.weaviate_version }}
    restart: on-failure:0
    ports:
     - "8080:8080"
    environment:
      QUERY_DEFAULTS_LIMIT: 20
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: "./data"
      DEFAULT_VECTORIZER_MODULE: text2vec-openai
      ENABLE_MODULES: text2vec-openai
      OPENAI_APIKEY: sk-foobar # request a key on openai.com
```

_Note: you can also use the [Weaviate configuration tool](../getting-started/installation.html#customize-your-weaviate-setup) to create a Weaviate setup with this module._

_Note: Starting with `v1.11.0` the `OPENAI_APIKEY` variable is now optional and you can instead provide the key at insert/query time as an HTTP header._

### Providing the API Key at runtime
Starting with version `v1.11.0` you no longer need to provide the API key as an environment variable. Alternatively you can now also set it at query time. To do so include the following HTTP Header in every request that contacts the OpenAI API (e.g. both inserts and queries): `X-OpenAI-Api-Key: <openai-api-key>`.

### Model selection on class level

If you want to use the OpenAI embeddings for your data objects, you need to set the `text2vec-openai` vectorizer on a class level. Working with Weaviate classes in a schema is described in detail [here](../data-schema/schema-configuration.html). Weaviate automatically determines which endpoints need to be used for vectorizing and querying data.

#### Available models

OpenAI has multiple models available with different trade-offs. All the models offered by OpenAI can be used within Weaviate. Note that the more dimensions a model produces, the larger your data footprint will be. To estimate the total size of your dataset use [this](../architecture/resources.html#an-example-calculation) calculation.

* For document embeddings you can choose one of the following models:
  * [ada](https://beta.openai.com/docs/engines/ada)
  * [babbage](https://beta.openai.com/docs/engines/babbage)
  * [curie](https://beta.openai.com/docs/engines/curie)
  * [davinci](https://beta.openai.com/docs/engines/davinci)
* For code embeddings you can choose one of the following models:
  * [ada](https://beta.openai.com/docs/engines/ada)
  * [babbage](https://beta.openai.com/docs/engines/babbage)

In the `moduleConfig` inside a class, you need to set two values:

1. `model` – one of the models mentioned above. E.g., `babbage`.
2. `type` – `text` or `code`.

#### Example class configuration

The following schema configuration uses the `babbage` model. 

```json
{
  "classes": [
    {
      "class": "Document",
      "description": "A class called document",
      "moduleConfig": {
        "text2vec-openai": {
          "model": "babbage",
          "type": "text"
        }
      },
      "properties": [
        {
          "dataType": [
            "text"
          ],
          "description": "Content that will be vectorized",
          "moduleConfig": {
            "text2vec-openai": {
              "skip": false,
              "vectorizePropertyName": false
            }
          },
          "name": "content"
        }
      ]
    }
  ]
}
```

# Additional GraphQL API parameters

## nearText

The `text2vec-openai` vectorizer module adds one search operator for `Get {}` and `Explore {}` GraphQL functions: `nearText: {}`. This operator can be used for semantically searching text in your dataset. 

Note: You cannot use multiple `'near'` filters, or a `'near'` operators along with an [`'ask'`](../reader-generator-modules/qna-transformers.html) filter!

### Example GraphQL Get(nearText{}) operator

{% include code/1.x/graphql.filters.nearText.html %}

{% include molecule-gql-demo.html encoded_query='%7B%0D%0A++Get%7B%0D%0A++++Publication%28%0D%0A++++++nearText%3A+%7B%0D%0A++++++++concepts%3A+%5B%22fashion%22%5D%2C%0D%0A++++++++certainty%3A+0.7%2C%0D%0A++++++++moveAwayFrom%3A+%7B%0D%0A++++++++++concepts%3A+%5B%22finance%22%5D%2C%0D%0A++++++++++force%3A+0.45%0D%0A++++++++%7D%2C%0D%0A++++++++moveTo%3A+%7B%0D%0A++++++++++concepts%3A+%5B%22haute+couture%22%5D%2C%0D%0A++++++++++force%3A+0.85%0D%0A++++++++%7D%0D%0A++++++%7D%0D%0A++++%29%7B%0D%0A++++++name%0D%0A++++++_additional+%7B%0D%0A++++++++certainty%0D%0A++++++%7D%0D%0A++++%7D%0D%0A++%7D%0D%0A%7D' %}

### Example GraphQL Explore(nearText{}) operator

{% include code/1.x/graphql.explore.simple.html %}

{% include molecule-gql-demo.html encoded_query='%7B%0D%0A++Explore+%28%0D%0A++++nearText%3A+%7B%0D%0A++++++concepts%3A+%5B%22New+Yorker%22%5D%2C%0D%0A++++++certainty%3A+0.95%2C%0D%0A++++++moveAwayFrom%3A+%7B%0D%0A++++++++concepts%3A+%5B%22fashion%22%2C+%22shop%22%5D%2C%0D%0A++++++++force%3A+0.2%0D%0A++++++%7D%0D%0A++++++moveTo%3A+%7B%0D%0A++++++++concepts%3A+%5B%22publisher%22%2C+%22articles%22%5D%2C%0D%0A++++++++force%3A+0.5%0D%0A++++++%7D%2C%0D%0A++++%7D%0D%0A++%29+%7B%0D%0A++++beacon%0D%0A++++certainty%0D%0A++++className%0D%0A++%7D%0D%0A%7D' %}

### Certainty

You can set a minimum required `certainty`, which will be used to determine which data results to return. The value is a float between 0.0 (return all data objects, regardless of similarity) and 1.0 (only return data objects that match completely, without any uncertainty). The certainty of a query result is computed by normalized distance of the fuzzy query and the data object in the vector space.

### Moving

Because pagination is not possible in multidimensional storage, you can improve your results with additional explore functions which can move away from semantic concepts or towards semantic concepts. E.g., if you look for the concept 'New York Times' but don't want to find the city New York, you can use the `moveAwayFrom{}` function by using the words 'New York'. This is also a way to exclude concepts and to deal with negations (`not` operators in similar query languages). Concepts in the `moveAwayFrom{}` filter are not per definition excluded from the result, but the resulting concepts are further away from the concepts in this filter.

Moving can be done based on `concepts` and/or `objects`. 
* `concepts` requires a list of one or more words
* `objects` requires a list of one or more objects, given by their `id` or `beacon`. For example:

```graphql
{
  Get{
    Publication(
      nearText: {
        concepts: ["fashion"],
        certainty: 0.7,
        moveTo: {
            objects: [{
                beacon: "weaviate://localhost/e5dc4a4c-ef0f-3aed-89a3-a73435c6bbcf"
            }, {
                id: "9f0c7463-8633-30ff-99e9-fd84349018f5" 
            }],
            concepts: ["summer"],
            force: 0.9
        }
      }
    ){
      name
      _additional {
        certainty
        id
      }
    }
  }
}
```

# More resources

{% include docs-support-links.html %}