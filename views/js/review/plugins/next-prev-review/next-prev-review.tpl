<div data-control="{{control}}" class="next-prev-review">
	<button data-control="{{prev.control}}" class="small btn-info btn-group action review-prev">
		<span class="icon icon-{{prev.icon}} no-label"></span>
	</button>
	<button data-control="{{next.control}}" class="small btn-info btn-group action review-next">
		<div>
			{{next.text}}
			<span class="icon icon-{{next.icon}}{{#unless prev.text}} no-label{{/unless}}"></span>
		</div>
	</button>
</li>

