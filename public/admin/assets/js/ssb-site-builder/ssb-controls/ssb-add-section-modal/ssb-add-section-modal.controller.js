'use strict';
/*global app*/
app.controller('SiteBuilderAddSectionModalController', ['$timeout', 'parentVm', function ($timeout, parentVm) {

	var sectionLabel;
	var vm = this;

	vm.parentVm = parentVm;

	/*
	* @platformSections
	* - an array of section types and icons for the add section modal
	* - TODO: move to service
	*/

	vm.platformSections = [
  {
    title: 'Hero Image',
    type: 'ssb-hero',
    preview: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=SSB%20Hero%20Image&w=350&h=150',
    filter: 'misc',
    description: 'Introduce your business with this section on the top of your home page.',
    enabled: true
  },{
    title: 'Header',
    type: 'ssb-header',
    preview: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=SSB%20Header&w=350&h=150',
    filter: 'navigation',
    description: 'Introduce your business with this section on the top of your home page.',
    enabled: true
  },
  {
		title: 'Blog',
		type: 'blog',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
		filter: 'blog',
		description: 'Use this section for your main blog page which displays all your posts with a sidebar of categories, tags, recent posts, and posts by author.',
		enabled: true
	}, {
		title: 'Blog Teaser',
		type: 'blog-teaser',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog-teaser.png',
		filter: 'blog',
		description: 'The Blog Teaser is perfect to showcase a few of your posts with a link to your full blog page.',
		enabled: true
	}, {
		title: 'Masthead',
		type: 'masthead',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/masthead.jpg',
		filter: 'misc',
		description: 'Introduce your business with this section on the top of your home page.',
		enabled: true
	}, {
		title: 'Feature List',
		type: 'feature-list',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-list.jpg',
		filter: 'features',
		description: 'Showcase what your business offers with a feature list.',
		enabled: true
	}, {
		title: 'Contact Us',
		type: 'contact-us',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/contact-us.jpg',
		filter: 'contact',
		description: 'Let your visitors where your located, how to contact you, and what your business hours are.',
		enabled: true
	}, {
		title: 'Coming Soon',
		type: 'coming-soon',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/coming-soon.jpg',
		filter: 'misc',
		description: 'Even if your site isn\'t ready you can use this section to let your visitors know you will be availiable soon.',
		enabled: true
	}, {
		title: 'Feature block',
		type: 'feature-block',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-block.jpg',
		filter: 'features',
		description: 'Use this section to show one important feature or maybe a quote.',
		enabled: true
	},{
		title: 'Footer',
		type: 'footer',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/footer.png',
		filter: 'misc',
		description: 'Use this section to show footer on your page.',
		enabled: false
	}, {
		title: 'Image Gallery',
		type: 'image-gallery',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/gallery.jpg',
		filter: 'images',
		description: 'Display your images in this image gallery section with fullscreen large view.',
		enabled: true
	}, {
		title: 'Image Text',
		version: 1,
		type: 'image-text',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/image-text.jpg',
		filter: 'images',
		description: 'Show an image next to a block of text on the right or the left.',
		enabled: true
	}, {
		title: 'Meet Team',
		type: 'meet-team',
		icon: 'fa fa-users',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/meet-team.png',
		filter: 'team',
		description: 'Let your visitors know about the team behind your business. Show profile image, position, bio, and social links for each member.',
		enabled: true
	}, {
		title: 'Navigation 1',
		type: 'navigation',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/navbar-v1.jpg',
		filter: 'navigation',
		description: 'A simple navigation bar with the logo on the left and nav links on the right. Perfect for horizontal logos.',
		version: 1,
		enabled: true
	}, {
		title: 'Navigation 2',
		type: 'navigation',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v2-preview.png',
		filter: 'navigation',
		description: 'If your logo is horizontal or square, this navigation will showcase your logo perfectly with addtional space for more links.',
		version: 2,
		enabled: true
	}, {
		title: 'Navigation 3',
		type: 'navigation',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v3-preview.png',
		filter: 'navigation',
		description: 'This navigation features a large block navigation links for a modern feel.',
		version: 3,
		enabled: true
	}, {
		title: 'Products',
		type: 'products',
		icon: 'fa fa-money',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/products.png',
		filter: 'products',
		description: 'Use this as the main products page to start selling. It comes together with a cart and checkout built in.',
		enabled: true
	}, {
		title: 'Pricing Tables',
		type: 'pricing-tables',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/pricing-tables.png',
		filter: 'text',
		description: 'Subscription product types with multiple options are best when shown in a pricing table to help the visitor decide which one is best for them.',
		enabled: true
	}, {
		title: 'Simple form',
		type: 'simple-form',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/simple-form.jpg',
		filter: 'forms',
		description: 'Automatically create contacts in the backend when a visitor submits this form. Add first name, last name, email, or phone number fields.',
		enabled: true
	}, {
		title: 'Single Post',
		type: 'single-post',
		icon: 'custom single-post',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45274f46-0a21-11e5-83dc-0aee4119203c.png',
		filter: 'blog',
		description: 'Used for single post design. This is a mandatory page used to show single posts. This will apply to all posts.',
		enabled: false
	}, {
		title: 'Social',
		type: 'social-link',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/social-links.jpg',
		filter: 'social',
		description: 'Let your visitors know where else to find you on your social networks. Choose from 18 different networks.',
		enabled: true
	}, {
		title: 'Video',
		type: 'video',
		icon: 'fa fa-video',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/video.png',
		filter: 'video',
		description: 'Showcase a video from Youtube, Vimeo, or an uploaded one. You can simply add the url your video is currently located.',
		enabled: true
	}, {
		title: 'Text Block',
		type: 'text-only',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/text-block.jpg',
		filter: 'text',
		description: 'A full width section for a large volume of text. You can also add images within the text.',
		enabled: true
	}, {
		title: 'Thumbnail Slider',
		type: 'thumbnail-slider',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/thumbnail.png',
		filter: 'images',
		description: 'Perfect for sponsor or client logos you have worked with in the past. Works best with logos that have a transparent background. ',
		enabled: true
	}, {
		title: 'Top Bar',
		type: 'top-bar',
		icon: 'fa fa-info',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/top-bar.png',
		filter: 'contact',
		description: 'Show your social networks, phone number, business hours, or email right on top that provides visitors important info quickly.',
		enabled: true
	}, {
		title: 'Testimonials',
		type: 'testimonials',
		icon: 'fa fa-info',
		preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45263570-0a21-11e5-87dd-b37fd2717aeb.png',
		filter: 'text',
		description: 'A section to showcase your testimonials.',
		enabled: true
	}];

	//enabled section types
	vm.enabledPlatformSections = _.where(vm.platformSections, {
		enabled: true
	});





	/************************************************************************************************************
	* Takes the platformSections object and gets the value for the filter property from any that are enabled.
	* It then makes that list unique, sorts the results alphabetically, and and removes the misc value if
	* it exists. (The misc value is added back on to the end of the list later)
	************************************************************************************************************/
	vm.sectionFilters = _.without(_.uniq(_.pluck(_.sortBy(vm.enabledPlatformSections, 'filter'), 'filter')), 'misc');

	// Iterates through the array of filters and replaces each one with an object containing an
	// upper and lowercase version
	_.each(vm.sectionFilters, function (element, index) {
		sectionLabel = element.charAt(0).toUpperCase() + element.substring(1).toLowerCase();
		vm.sectionFilters[index] = {
		  'capitalized': sectionLabel,
		  'lowercase': element
		};
		sectionLabel = null;
	});

	// Manually add the All option to the begining of the list
	vm.sectionFilters.unshift({
		'capitalized': 'All',
		'lowercase': 'all'
	});

	// Manually add the Misc section back on to the end of the list
	// Exclude 'Misc' filter for emails
	vm.sectionFilters.push({
	  'capitalized': 'Misc',
	  'lowercase': 'misc'
	});

	vm.setFilterType = function (label) {
		vm.typefilter = label;
	};

}]);
