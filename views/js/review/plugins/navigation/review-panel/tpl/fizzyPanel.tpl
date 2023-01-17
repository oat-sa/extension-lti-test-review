<div class="review-panel fizzy">
    <header class="review-panel-header">
        <div class="review-panel-title">{{headerTitle}}</div>
        {{#if header}}
            <div class="review-panel-score-header">
            {{#with header}}
                <span class="review-panel-label">{{label}}</span>
                <span class="review-panel-score">{{score}}</span>
            {{/with}}
            </div>
        {{/if}}
    </header>
    <nav class="review-panel-content"></nav>
{{#if footer}}
    <footer class="review-panel-footer">
    {{#with footer}}
        <span class="review-panel-label">{{label}}</span>
        <span class="review-panel-score">{{score}}</span>
    {{/with}}
    </footer>
{{/if}}
</div>
