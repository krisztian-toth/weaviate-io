---
title: How Weaviate’s GraphQL API was designed
slug: GraphQL-API-design
authors: [laura] 
date: 2021-01-27
tags: []
image: ./img/hero.png
# canonical-url: https://medium.com/semi-technologies/how-weaviates-graphql-api-was-designed-b38885aa9cee
# canonical-name: Medium

# description: "Any kind of data storage architecture needs an API. You want your users, and their applications, to access and interact with their data. And no matter how complicated the database architecture itself is, you want this interaction to happen as intuitively as possible."
# published: true
# author: Laura Ham
# author-img: /img/people/icon/laura.jpg
# card-img: /img/blog/hero/graphql-api-design-card.png
# toc: true
# redirect_from: /blog/2021/01/GraphQL-API-design.html
---


Choosing a good API, its design and development, is a crucial but time-consuming process, especially if you want to develop one in an ongoing software development project.

Weaviate uses the API query language [GraphQL](https://graphql.org/){:target="_blank"}. GraphQL enables efficient development and provides high user experience (UX) for data interaction.

In this article we explain how the use of GraphQL leverages the UX of Weaviate, and how we approach the design of this API.

<a href="/developers/weaviate/current/" target="_blank"><img src="./img/weaviate-demo.gif?i=8" alt="Demo of Weaviate" width="100%" /></a>

## What is Weaviate and why does it need an API?
Weaviate is an [open-source](https://github.com/semi-technologies/weaviate){:target="_blank"} Vector Search Engine: for understandable knowledge representation, enabling semantic search and automatic classification. Weaviate does not only store data, but also its (automatically derived) context, consisting of linguistic information and relations to other concepts. The result is a network of knowledge, or a graph of data.

One core question is: How do we interact with this new type of data storage? Interacting with big data, enriched with contextual information, might sound even more overwhelming than interacting with a traditional, relational database.

Data needs to be added, retrieved and manipulated, all controlled by the user but enabled by the underlying database interface. Here’s where APIs jump in. Because of Weaviate’s graph-based architecture, an alternative to traditional RESTful APIs was what we were looking for.

## What is GraphQL, and why does Weaviate use it?
[GraphQL](https://graphql.org/){:target="_blank"} is an API query language, which was open-sourced by Facebook in 2012 and currently maintained by the Linux Foundation. The core strength of GraphQL is that the client is fully in control of what data is returned. This means that over-fetching is never a problem and the need for multiple requests is removed. In addition, using GraphQL allows fast API development and easy API evolvement over time, because of its powerful development tools and single evolving versioning.

All in all, many reasons to adopt GraphQL for the graph-like structure of Weaviate. GraphQL seems the perfect solution for intuitive database interaction and efficient development. Weaviate still uses traditional RESTful endpoints (using OpenAPI/Swagger) to add data, but the main interaction for data consumption goes via GraphQL.)

GraphQL still follows the same constraints as REST APIs, but data is organized into a graph using only one interface. Thus instead of endpoints, the API is organized in terms of types and fields. The fields of interest are specified by the client, chosen from a schema defined by the server. This requires a well formulated schema. Let’s dive into how we approach the design of Weaviate’s GraphQL API.

## Human-Centered API Design
So, how does our GraphQL design, development and implementation cycle look like? We approach this very carefully, since we are talking about a design for end-users, made by developers, two sides that differ in many ways. Instead of a data-driven approach, we took a user point of view. Humans tend to talk in interactions; we ask questions when we want to retrieve something, and use verbs or even commands if we want someone or something to do something for us. So why not also apply the same behaviour to interaction with data? So try to think about what you would want to get out of the database in different use cases (as a user), and how this could be done most efficiently. What naturally follows is the words that are frequently used in these interactions. We used these words in the design of our GraphQL schema.

Let’s look at an example. Consider you (digitally) store supermarket items in Weaviate, and now want to know which items are low in storage. This could be achieved by the following query:

```graphql
{
  Get {
    Product(
      where: {
        path: ["inStock"], 
        operator: LessThan, 
        valueInt: 100
      }) {
      name
      inStock
    }
  }
}
```

Which may return:

```json
{
  "data": {
    "Get": {
      "Product": [
        {
          "name": "Baguette",
          "inStock": 8
        },
        {
          "name": "Banana",
          "inStock": 46
        },
        {
          "name": "Pineapple",
          "inStock": 17
        },
        {
          "name": "Toilet paper",
          "inStock": 38
        }
      ]
    }
  }
}
```

Here’s how this query is structured. “Get” is a high level schema item that we defined. “Get” is a verb that we use when we want to retrieve something. What comes next is defined by the data schema of the user. This supermarket use case is storing “Products”, with at least the properties “name”, and “inStock”. The user might also store properties like “barcode” and “expirationDate”, but chose not to retrieve those in this request. The goal of this query is to Get all the Products where the Stock is less than 100. See how the query is formed?

The following query shows the automatic contextualization of concepts in Weaviate. Let’s say we are only interested in the fruit items that are low in stock, but we never explicitly stored the supermarket products by category like ‘fruits’, ‘dairy’ and ‘household’. We can then make the following query, where we want to Get all the Products where the Stock is less than 100, which are related to the text concept "fruits". Now, only the Banana and Pineapple will be returned because these items are most related to fruits. If we are looking for more results, then Baguette will be shown earlier in the list than Toilet paper, because it is semantically (and in a real supermarket) closer to fruits.)

```graphql
{
  Get {
    Product(
      where: {
        path: ["inStock"], 
        operator: LessThan, 
        valueInt: 100
      },
      nearText: {
        concepts: ["fruit"],
        certainty: 0.7
      }
    ) {
      name
      inStock
    }
  }
}
```

## Iterative Prototyping and Feedback
In the end, developers and UX designers need to collaborate in this requirement engineering process. The challenge is to match the user needs with technical possibilities, while supporting all features the underlying database has to offer. For the GraphQL API design of Weaviate, an iterative approach was taken. Quick prototypes of new ideas are made all the time, which are passed in a circle of UX designers, core developers and end-users, continuously gathering and implementing constructive feedback. Only when everyone is happy with the proposal (thus not only the developers), a final ‘pass’ is made to the core developers to implement it in the software.

## In conclusion
With Weaviate, we want to allow the end-user to be focused on their data, and thus not spend too much effort on thinking about how to actually access and interact with it. Only then we can ensure high user experience, and open doors to new insights. With GraphQL, users can count on predictable, fast and stable results, because they are in control of the data interaction. Using our human-centered, iterative design process, with a continuous prototyping and feedback loop, we enable efficient and effective data interaction.

[Click here](/developers/weaviate/current/graphql-references/index.html){:target="_blank"} to learn more about the complete GraphQL structure.

## What next
Check out the [Getting Started with Weaviate](/developers/weaviate/current/getting-started/index.html){:target="_blank"} and begin building amazing apps with Weaviate.

You can reach out to us on [Slack](https://join.slack.com/t/weaviate/shared_invite/zt-goaoifjr-o8FuVz9b1HLzhlUfyfddhw){:target="_blank"} or [Twitter](https://twitter.com/weaviate_io){:target="_blank"}.

Weaviate is open source, you can follow the project on [GitHub](https://github.com/semi-technologies/weaviate){:target="_blank"}. Don't forget to give us a ⭐️ while you are there.