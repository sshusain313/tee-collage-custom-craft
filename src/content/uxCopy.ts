
export const uxCopy = {
  // Project Creation - Group Leader
  projectCreation: {
    title: "Start Your Farewell Memory",
    subtitle: "Create something beautiful together—one last time",
    form: {
      groupName: {
        label: "What's your group called?",
        placeholder: "CS Dept Batch 2025, Marketing Team, etc.",
        helper: "This will appear on your T-shirt"
      },
      occasion: {
        label: "What's the occasion?",
        options: [
          "Graduation farewell",
          "Office send-off",
          "Team farewell",
          "Class reunion prep",
          "Project wrap-up",
          "Other celebration"
        ],
        placeholder: "Pick your moment..."
      },
      memberCount: {
        label: "How many faces will join?",
        helper: "Don't worry—you can adjust this later",
        placeholder: "25"
      },
      gridStyle: {
        label: "Choose your collage style",
        helper: "You can change this when designing",
        options: {
          hexagonal: "Hexagonal Grid (Classic)",
          square: "Square Grid (Clean)",
          circular: "Circular Flow (Artistic)",
          centerFocus: "Center Focus (Spotlight)"
        }
      },
      schoolLogo: {
        label: "Add your school/company logo? (Optional)",
        helper: "Make it official with your brand",
        uploadText: "Drop logo here or click to browse"
      }
    },
    cta: "Create My Project",
    loading: "Setting up your memory project..."
  },

  // Project Created - Generate Link
  projectCreated: {
    title: "Your project is ready! 🎉",
    subtitle: "Time to bring everyone together",
    projectId: "Project ID: {projectId}",
    shareSection: {
      title: "Share this magic link with your group:",
      helper: "Everyone clicks this to add their photo and name",
      linkText: "teecollage.com/upload?projectId={projectId}",
      copyButton: "Copy Link",
      copied: "Link copied! ✨"
    },
    instructions: {
      title: "What happens next:",
      steps: [
        "Share the link with all group members",
        "Each person uploads their photo and details",
        "You'll get notified when everyone's submitted",
        "Then you design the collage together!"
      ]
    },
    cta: "Share the Link",
    monitoring: "Monitor Progress"
  },

  // Member Upload Form
  memberUpload: {
    title: "Add yourself to the memory",
    subtitle: "You're part of something special—let's capture it",
    groupInfo: "Contributing to: {groupName}",
    form: {
      photo: {
        label: "Upload your best photo",
        helper: "Clear face shots work best. We'll make it look amazing!",
        uploadText: "Drop your photo here or click to browse",
        requirements: "JPG, PNG up to 10MB"
      },
      name: {
        label: "What should we call you?",
        placeholder: "Your name or nickname",
        helper: "This appears under your photo"
      },
      role: {
        label: "Your role or message (Optional)",
        placeholder: "Class President, 'Thanks for the memories!', etc.",
        helper: "Add a title, role, or short farewell message"
      },
      message: {
        label: "Personal farewell note (Optional)",
        placeholder: "A quick message for the group...",
        helper: "Share a memory, thank you, or inside joke"
      }
    },
    cta: "Add Me to the Collage",
    success: {
      title: "You're in! 🎊",
      message: "Your photo has been added to {groupName}'s farewell collage.",
      next: "Your group leader will arrange everyone's photos and order the T-shirts. You'll get updates via email!"
    },
    loading: "Adding your magic to the mix..."
  },

  // Progress Monitoring - Group Leader
  progressMonitoring: {
    title: "Collecting memories...",
    subtitle: "Watch your group come together",
    status: {
      incomplete: "{submitted} of {total} members have joined",
      complete: "Everyone's in! Time to design 🎨",
      recent: "Recent submissions:",
      empty: "Waiting for the first submission..."
    },
    actions: {
      remindAll: "Send Gentle Reminder",
      addMore: "Add More Members",
      startDesign: "Start Designing",
      shareAgain: "Share Link Again"
    },
    notifications: {
      newSubmission: "{name} just joined the collage!",
      allComplete: "🎉 All members submitted! Ready to design."
    }
  },

  // Collage Editor - Group Leader
  collageEditor: {
    title: "Design your memory",
    subtitle: "Arrange everyone's faces with love",
    toolbar: {
      centerFace: {
        label: "Pick your center face",
        helper: "Who should be in the spotlight?",
        button: "Choose Center"
      },
      rearrange: {
        label: "Drag to rearrange",
        helper: "Move photos until it feels right"
      },
      background: {
        label: "Background style",
        options: [
          "Classic White",
          "Soft Gradient",
          "School Colors",
          "Vintage Paper",
          "Custom Color"
        ]
      },
      text: {
        label: "Add group text",
        options: [
          "Group name",
          "Graduation year",
          "Farewell message",
          "Inside joke",
          "Custom text"
        ]
      },
      logo: {
        label: "Position logo",
        helper: "Drag to perfect spot"
      }
    },
    preview: {
      title: "See it come to life",
      subtitle: "Your collage on a premium T-shirt",
      tshirtOptions: {
        color: "Shirt color",
        style: "Shirt style",
        placement: "Design placement"
      }
    },
    cta: "This Looks Perfect!",
    autoSave: "Auto-saving your design..."
  },

  // T-shirt Preview & Ordering
  tshirtPreview: {
    title: "Your masterpiece awaits",
    subtitle: "See everyone together, ready to wear",
    customization: {
      title: "Make it yours",
      shirtType: {
        label: "Choose your T-shirt",
        options: [
          "Premium Cotton (Recommended)",
          "Vintage Blend",
          "Performance Fabric",
          "Eco-Friendly Cotton"
        ]
      },
      colors: {
        label: "Pick your color",
        popular: "Popular choices:",
        options: ["White", "Black", "Navy", "Gray", "Custom"]
      },
      sizes: {
        label: "Size breakdown",
        helper: "How many of each size?",
        guide: "Size Guide"
      }
    },
    pricing: {
      title: "Group pricing",
      breakdown: "Price per shirt",
      bulk: "Bulk discount applied!",
      total: "Total for {quantity} shirts",
      shipping: "Free shipping on orders over $200"
    },
    payment: {
      title: "Payment options",
      options: [
        "I'll pay for everyone (easiest)",
        "Split payment via group link",
        "Individual payments"
      ]
    },
    cta: "Order Our Memory T-Shirts",
    guarantee: "30-day happiness guarantee • Free exchanges"
  },

  // Order Confirmation
  orderConfirmation: {
    title: "Memory T-shirts ordered! 🎉",
    subtitle: "Your farewell gift is on its way",
    details: {
      orderId: "Order #{orderId}",
      timeline: "Expected delivery: {date}",
      tracking: "Tracking info sent to all members"
    },
    downloadSection: {
      title: "Download your artwork",
      subtitle: "High-res version for keepsakes",
      cta: "Download Print-Ready File"
    },
    sharing: {
      title: "Share the excitement",
      subtitle: "Let everyone know their shirts are coming!",
      message: "🎊 Our {groupName} farewell T-shirts are ordered! Can't wait to wear our memories together.",
      cta: "Share Update"
    },
    support: {
      title: "Questions?",
      subtitle: "We're here to help make this perfect",
      contact: "Contact Support"
    }
  },

  // General UI Elements
  ui: {
    navigation: {
      home: "Home",
      create: "Create Collage",
      preview: "Preview & Order",
      help: "Help"
    },
    buttons: {
      next: "Next Step",
      back: "Go Back",
      save: "Save Progress",
      cancel: "Cancel",
      done: "Done",
      edit: "Edit",
      remove: "Remove",
      add: "Add",
      upload: "Upload",
      download: "Download",
      share: "Share",
      copy: "Copy",
      preview: "Preview",
      order: "Order Now"
    },
    status: {
      saving: "Saving...",
      loading: "Loading...",
      uploading: "Uploading...",
      processing: "Processing...",
      complete: "Complete!",
      error: "Oops, something went wrong"
    },
    notifications: {
      saved: "Changes saved!",
      copied: "Copied to clipboard!",
      uploaded: "Photo uploaded successfully!",
      removed: "Item removed",
      error: "Please try again"
    }
  },

  // Error Messages
  errors: {
    upload: {
      fileSize: "Photo too large—please pick one under 10MB",
      fileType: "We need a photo file (JPG, PNG, etc.)",
      network: "Upload failed—check your connection and try again",
      generic: "Something went wrong. Please try uploading again."
    },
    form: {
      required: "This field is required",
      groupName: "Please enter a group name",
      memberCount: "Please enter the number of members",
      invalidEmail: "Please enter a valid email address"
    },
    project: {
      notFound: "Project not found—check your link",
      expired: "This project link has expired",
      full: "This project is full—contact your group leader"
    }
  },

  // Success Messages
  success: {
    projectCreated: "Project created! Time to share the magic.",
    photoUploaded: "Photo added! You're now part of the memory.",
    designSaved: "Design saved! Looking good.",
    orderPlaced: "Order placed! Your shirts are on the way.",
    linkCopied: "Link copied—ready to share!",
    reminderSent: "Gentle reminder sent to the group."
  },

  // Tooltips and Help Text
  help: {
    gridStyles: "Different layouts for your photos—you can change this later!",
    centerFace: "Choose the person who should be featured prominently",
    photoQuality: "Clear, well-lit photos work best. We'll handle the rest!",
    bulkPricing: "More shirts = better prices for everyone",
    splitPayment: "Everyone gets a link to pay for their own shirt",
    designTips: "Drag photos around until it feels right—there's no wrong way!"
  }
};

// Helper functions for dynamic content
export const getDynamicContent = {
  projectLink: (projectId: string) => `teecollage.com/upload?projectId=${projectId}`,
  progressStatus: (submitted: number, total: number) => 
    `${submitted} of ${total} members have joined`,
  orderTotal: (quantity: number, price: number) => 
    `Total for ${quantity} shirts: $${(quantity * price).toFixed(2)}`,
  expectedDelivery: (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};
