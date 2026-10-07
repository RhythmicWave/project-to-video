import copy
import importlib.util
import json
from pathlib import Path
import unittest

root=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('story_validator',root/'scripts/validate-story-model.py')
validator=importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

class StoryDesign(unittest.TestCase):
    def setUp(self):
        self.model=json.loads((root/'assets/story-model.example.json').read_text(encoding='utf-8'))

    def test_supported_example_passes_both_modes(self):
        self.assertEqual(validator.validate(self.model),[])
        self.assertEqual(validator.validate(self.model,check_design=True),[])

    def test_empty_evidence_is_rejected(self):
        self.model['flows'][0]['steps'][0]['evidence']=[]
        self.assertTrue(validator.validate(self.model))

    def test_missing_trigger_and_disconnected_branch_are_rejected(self):
        del self.model['flows'][0]['trigger']
        self.model['flows'][0]['branches'][0]['next']='missing'
        self.assertGreaterEqual(len(validator.validate(self.model)),2)

    def test_design_cannot_omit_technical_basis_or_visual_consequence(self):
        del self.model['scenes'][0]['technical_anchors']
        del self.model['scenes'][0]['visible_change']
        self.assertEqual(validator.validate(self.model),[],'base exploration mode stays compatible')
        self.assertGreaterEqual(len(validator.validate(self.model,check_design=True)),2)

    def test_design_requires_a_scene_and_valid_presentation_level(self):
        self.model['scenes'][0]['level']='all_details'
        self.assertTrue(validator.validate(self.model,check_design=True))
        self.model['scenes']=[]
        self.assertTrue(validator.validate(self.model,check_design=True))

if __name__=='__main__':unittest.main()
