import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('inspection',Path(__file__).with_name('inspect-video.py'))
inspection=importlib.util.module_from_spec(spec)
spec.loader.exec_module(inspection)

class EndFrame(unittest.TestCase):
    def test_rounded_duration_does_not_add_a_frame(self):
        self.assertEqual(inspection.last_video_frame({'nb_frames':'3803'},126.766667,30),3802)
        self.assertEqual(inspection.last_video_frame({},126.766667,30),3802)
        self.assertEqual(inspection.last_video_frame({'nb_frames':'N/A'},116.033333,30),3480)

    def test_single_frame_clip(self):
        self.assertEqual(inspection.last_video_frame({'nb_frames':'1'},.033333,30),0)

if __name__=='__main__':unittest.main()
