<div data-control="{{control}}" class="next-prev-review">
  {{#if prev}}
		<button data-control="{{prev.control}}" class="small btn-info btn-group action review-prev">
			<a class="li-inner" href="#" onclick="return false">
				{{#if prev.icon}}<span class="icon icon-{{prev.icon}}{{#unless prev.text}} no-label{{/unless}}"></span>{{/if}}
				{{#if prev.text}}<span class="text">{{prev.text}}</span>{{/if}}
			</a>
		</button>
	{{/if}}
	{{#if next}}
		<button data-control="{{next.control}}" class="small btn-info btn-group action review-next">
			<a class="li-inner" href="#" onclick="return false">
				{{#if next.text}}<span class="text">{{next.text}}</span>{{/if}}
				{{#if next.icon}}<span class="icon icon-{{next.icon}}{{#unless prev.text}} no-label{{/unless}}"></span>{{/if}}
			</a>
		</button>
	{{/if}}
</li>

