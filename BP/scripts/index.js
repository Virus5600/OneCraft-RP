import CRWAS from './chat_ranks_with_anti_spam/index';
import DISTANCE_INDICATOR from './distance_indicator/main';
import EPIC_KNIGHTS_MOD from './epic_knights_mod/index';
import HEALTH_BAR from './health_bar/main';
import LAND_CLAIM_V1 from './land_claim_v1/main';
import UASSIST_HOME from './uassist_home/zxk';
import UI_QUEUE from './ui_queue/main';
import ART_ENTHUSIASM from './art_enthusiasm/index';

//////////////////////
// EPIC KNIGHTS MOD //
//////////////////////
EPIC_KNIGHTS_MOD.init();

////////////////////////
// DISTANCE INDICATOR //
////////////////////////
DISTANCE_INDICATOR.init();

/////////////////////////////////////////
//             UI QUEUE                //
// (Dynamic 3rd Person Cam Dependency) //
/////////////////////////////////////////
UI_QUEUE.init();

////////////////
// HEALTH BAR //
////////////////
HEALTH_BAR.init();

///////////////////////////////
// CHAT RANKS WITH ANTI SPAM //
///////////////////////////////
CRWAS.init();

//////////////////
// UASSIST HOME //
//////////////////
UASSIST_HOME.init();

///////////////////
// LAND CLAIM V1 //
///////////////////
LAND_CLAIM_V1.init();

////////////////////
// ART ENTHUSIASM //
////////////////////
ART_ENTHUSIASM.init();