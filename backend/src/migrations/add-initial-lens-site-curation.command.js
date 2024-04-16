// add initial Lens Site Curation document

import {ObjectId} from "mongodb";
import {agreementCategoryTypeMap} from "../services/agreements/agreements.subdocs.js";
import {navTargetMap} from "../curation.schema.js";

export async function addInitialLensSiteCurationCommand(app) {

  const agreementsService = app.service('agreements');

  console.log(">>> Add Lens Site Curation Doc");
  const lscCheck = await agreementsService.find({
    query: {
      category: agreementCategoryTypeMap.lensSiteCuration,
    }
  });
  if (lscCheck.data.length === 0) {
    const lscId = new ObjectId();
    const lscSummary = {
      agreementDocId: lscId,
      title: 'Ondsel Lens Curation',
      effective: new Date(2024, 2, 19).getTime(), // 2 = March
      deprecated: null,
      version: '20240319',
      markdownContent: 'Lens is a system of storing, sharing, and collaborating on CAD models.',
      curation: {
        _id: lscId,
        collection: 'agreements',
        nav: {
          target: navTargetMap.ondsel,
        },
        name: 'ondsel-lens-curation',
        slug: '',
        description: 'Current Headline Goes Here', // max: 80 runes
        longDescriptionMd: '',
        tags: [], // not used YET
        representativeFile: null, // not used YET
        promoted: [],
        keywordRefs: [], // NOT USED; probably never but that is hard to predict
      },
      docPostedAt: Date.now(),
    }
    const lscResult = await agreementsService.create({
      category: agreementCategoryTypeMap.lensSiteCuration,
      current: lscSummary,
      history: [lscSummary],
    });
    console.log(">>>   added doc");
  } else {
    console.log(">>>   skipped as doc already exists");
  }
  console.log(">>> Complete.")
}
