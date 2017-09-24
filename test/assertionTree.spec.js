/*global expect*/
const assertionTree = require('../lib/assertionTree');

const type = (name, minimum, maximum) => ({
    type: expect.getType(name),
    minimum: typeof minimum === 'number' ? minimum : 1,
    maximum: typeof maximum === 'number' ? maximum : 1
});

describe('assertionTree', () => {
    it('works :-)', () => {
        let tree = assertionTree.emptyNode;
        tree = assertionTree.addAssertion(tree, [type('string'), 'to be', type('string')]);
        tree = assertionTree.addAssertion(tree, [type('any'), 'to be', type('any')]);
        tree = assertionTree.addAssertion(tree, [type('any'), 'to equal', type('any')]);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to have keys', type('string', 1, Infinity)]);
        tree = assertionTree.addAssertion(tree, [type('object'), 'to have keys', type('array')]);

        expect(tree, 'to equal', {
            typeEdges: [
                {
                    value: type('string'),
                    node: {
                        typeEdges: [],
                        textEdges: { 'to be': { typeEdges: [ { value: type('string'), node: {} } ], textEdges: {} } }
                    }
                },
                {
                    value: type('object'),
                    node: {
                        typeEdges: [],
                        textEdges: {
                            'to have keys': {
                                typeEdges: [
                                    { value: type('string', 1, Infinity), node: {} },
                                    { value: type('array'), node: {} }
                                ],
                                textEdges: {}
                            }
                        }
                    }
                },
                {
                    value: type('any'),
                    node: {
                        typeEdges: [],
                        textEdges: {
                            'to be': { typeEdges: [ { value: type('any'), node: {} } ], textEdges: {} },
                            'to equal': { typeEdges: [ { value: type('any'), node: {} } ], textEdges: {} }
                        }
                    }
                }
            ],
            textEdges: {}
        });
    });
});
