
// Utility functions for sorting teachers by position hierarchy
const POSITION_ORDER = {
  'ผู้อำนวยการ': 1,
  'ครูวิทยฐานะชำนาญการพิเศษ': 2,
  'ครูวิทยฐานะชำนาญการ': 3,
  'ครู': 4,
  'ครูผู้ช่วย': 5,
  'ครูอัตราจ้าง': 6,
  'ครูพี่เลี้ยงเด็กพิการ': 7,
  'นักการภารโรง': 8,
};

export const getPositionOrder = (position: string): number => {
  // Check for exact match first
  if (POSITION_ORDER[position as keyof typeof POSITION_ORDER]) {
    return POSITION_ORDER[position as keyof typeof POSITION_ORDER];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(POSITION_ORDER)) {
    if (position?.includes(key)) {
      return value;
    }
  }
  
  // Default to end of list for unknown positions
  return 999;
};

export const sortTeachersByPosition = (teachers: any[]) => {
  return teachers.sort((a, b) => {
    const aOrder = getPositionOrder(a.position || '');
    const bOrder = getPositionOrder(b.position || '');
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // If same position order, sort by positionNumber
    const aNum = parseInt(a.positionNumber) || 0;
    const bNum = parseInt(b.positionNumber) || 0;
    return aNum - bNum;
  });
};
